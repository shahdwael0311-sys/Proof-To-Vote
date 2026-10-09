import hashlib
import hmac
import os
import re
import secrets
from datetime import datetime, timedelta, timezone

import dotenv
import jwt
import mysql.connector
from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

dotenv.load_dotenv()
app = FastAPI(title="Proof-To-Vote API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def db():
    return mysql.connector.connect(
        user=os.environ["MYSQL_USER"], password=os.environ["MYSQL_PASSWORD"],
        host=os.getenv("MYSQL_HOST", "127.0.0.1"), database=os.getenv("MYSQL_DB", "voter_db")
    )


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 120000).hex()
    return f"pbkdf2_sha256${salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    # Plain text remains accepted only for compatibility with the original seed rows.
    if not stored.startswith("pbkdf2_sha256$"):
        return hmac.compare_digest(password, stored)
    _, salt, expected = stored.split("$", 2)
    actual = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 120000).hex()
    return hmac.compare_digest(actual, expected)


def issue_token(row: dict) -> str:
    payload = {
        "voter_id": row["voter_id"], "role": row["role"], "wallet_address": row.get("wallet_address"),
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
    }
    return jwt.encode(payload, os.environ["SECRET_KEY"], algorithm="HS256")


def current_user(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Login required")
    try:
        return jwt.decode(authorization[7:], os.environ["SECRET_KEY"], algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def admin(user=Depends(current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


class Login(BaseModel):
    voter_id: str = Field(min_length=1, max_length=36)
    password: str = Field(min_length=1, max_length=255)


class Registration(BaseModel):
    voter_id: str = Field(min_length=3, max_length=36)
    password: str = Field(min_length=6, max_length=128)
    email: str = Field(min_length=5, max_length=255)
    student_id: str = Field(min_length=2, max_length=64)
    wallet_address: str


class KycUpdate(BaseModel):
    status: str


class AuditProof(BaseModel):
    wallet_address: str
    candidate_id: int = Field(gt=0)
    proof_hash: str
    proof_uri: str
    tx_hash: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/register", status_code=201)
def register(data: Registration):
    wallet = data.wallet_address.lower()
    if not re.fullmatch(r"0x[a-fA-F0-9]{40}", wallet):
        raise HTTPException(422, "Invalid Ethereum wallet address")
    connection = db()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "INSERT INTO voters (voter_id, role, password, email, student_id, wallet_address, kyc_status) "
            "VALUES (%s, 'user', %s, %s, %s, %s, 'pending')",
            (data.voter_id.strip(), hash_password(data.password), data.email.lower().strip(),
             data.student_id.strip(), wallet),
        )
        connection.commit()
        return {"message": "Registration submitted. An admin must approve KYC before login."}
    except mysql.connector.IntegrityError:
        raise HTTPException(409, "Voter ID, email, student ID, or wallet is already registered")
    finally:
        connection.close()


@app.post("/login")
def login(data: Login):
    connection = db()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM voters WHERE voter_id = %s", (data.voter_id,))
        row = cursor.fetchone()
        if not row or not verify_password(data.password, row["password"]):
            raise HTTPException(status_code=401, detail="Invalid voter ID or password")
        if row["role"] != "admin" and row["kyc_status"] != "approved":
            raise HTTPException(status_code=403, detail=f"KYC status is {row['kyc_status']}; login is blocked")
        return {"token": issue_token(row), "role": row["role"], "wallet_address": row.get("wallet_address")}
    finally:
        connection.close()


@app.get("/me")
def me(user=Depends(current_user)):
    return user


@app.get("/voters")
def voters(_: dict = Depends(admin)):
    connection = db()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT voter_id, email, student_id, wallet_address, kyc_status, nft_token_id, created_at FROM voters WHERE role='user' ORDER BY created_at DESC")
        return cursor.fetchall()
    finally:
        connection.close()


@app.patch("/voters/{voter_id}/kyc")
def update_kyc(voter_id: str, data: KycUpdate, _: dict = Depends(admin)):
    if data.status not in ("approved", "rejected"):
        raise HTTPException(422, "Status must be approved or rejected")
    connection = db()
    try:
        cursor = connection.cursor()
        cursor.execute("UPDATE voters SET kyc_status=%s WHERE voter_id=%s AND role='user'", (data.status, voter_id))
        if cursor.rowcount != 1:
            raise HTTPException(404, "Voter not found")
        connection.commit()
        return {"message": f"KYC {data.status}"}
    finally:
        connection.close()


class NftUpdate(BaseModel):
    token_id: int = Field(gt=0)


@app.patch("/voters/{voter_id}/nft")
def save_nft(voter_id: str, data: NftUpdate, _: dict = Depends(admin)):
    connection = db()
    try:
        cursor = connection.cursor()
        cursor.execute("UPDATE voters SET nft_token_id=%s WHERE voter_id=%s AND kyc_status='approved'", (data.token_id, voter_id))
        if cursor.rowcount != 1:
            raise HTTPException(409, "Voter must be KYC approved before minting")
        connection.commit()
        return {"message": "NFT token recorded"}
    finally:
        connection.close()


@app.post("/audit", status_code=201)
def add_audit(proof: AuditProof, user=Depends(current_user)):
    if user.get("role") != "user" or user.get("wallet_address", "").lower() != proof.wallet_address.lower():
        raise HTTPException(403, "Wallet does not match logged-in voter")
    connection = db()
    try:
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO vote_audit (wallet_address, candidate_id, proof_hash, proof_uri, tx_hash) VALUES (%s,%s,%s,%s,%s)",
            (proof.wallet_address.lower(), proof.candidate_id, proof.proof_hash, proof.proof_uri, proof.tx_hash),
        )
        connection.commit()
        return {"message": "Vote proof saved"}
    except mysql.connector.IntegrityError:
        raise HTTPException(409, "This transaction or wallet already has an audit record")
    finally:
        connection.close()


@app.get("/audit")
def audit():
    connection = db()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT wallet_address, candidate_id, proof_hash, proof_uri, tx_hash, created_at FROM vote_audit ORDER BY created_at DESC")
        return cursor.fetchall()
    finally:
        connection.close()


@app.get("/stats")
def stats():
    connection = db()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT COUNT(*) registered, SUM(kyc_status='approved') approved, SUM(nft_token_id IS NOT NULL) nft_holders FROM voters WHERE role='user'")
        return cursor.fetchone()
    finally:
        connection.close()
