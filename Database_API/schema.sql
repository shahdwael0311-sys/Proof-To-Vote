CREATE DATABASE IF NOT EXISTS voter_db;
USE voter_db;

CREATE TABLE IF NOT EXISTS voters (
  voter_id VARCHAR(36) PRIMARY KEY,
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  student_id VARCHAR(64) UNIQUE,
  wallet_address VARCHAR(42) UNIQUE,
  kyc_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  nft_token_id BIGINT UNSIGNED UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vote_audit (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL UNIQUE,
  candidate_id BIGINT UNSIGNED NOT NULL,
  proof_hash VARCHAR(66) NOT NULL,
  proof_uri VARCHAR(255) NOT NULL,
  tx_hash VARCHAR(66) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO voters (voter_id, role, password, email, student_id, wallet_address, kyc_status)
VALUES ('admin', 'admin', 'admin123', 'admin@university.local', 'ADMIN-001', NULL, 'approved')
ON DUPLICATE KEY UPDATE role='admin', kyc_status='approved';

-- After importing Ganache accounts, register voter1/voter2 through the UI so
-- their exact wallet addresses are bound and duplicate checks are exercised.
