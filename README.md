# Proof-To-Vote 
### A Blockchain-Based Electronic Voting System

**Proof-To-Vote** is a cybersecurity graduation project developed at the **Arab Academy for Science, Technology and Maritime Transport (AASTMT)**. It is a blockchain-based electronic voting system designed to support voter identity verification, voting eligibility enforcement, and the integrity and transparency of recorded votes.

The project integrates Ethereum smart contracts with a web application, a Python backend API, and a MySQL relational database. MetaMask provides wallet connectivity for blockchain interactions, while smart contracts enforce voting rules on-chain.

<img width="1280" height="598" alt="WhatsApp Image 2026-10-10 at 4 13 16 PM" src="https://github.com/user-attachments/assets/f17d3704-3908-410b-ae8e-4972a60cec93" />
<img width="1280" height="355" alt="WhatsApp Image 2026-10-10 at 4 13 17 PM" src="https://github.com/user-attachments/assets/37455ded-9f4c-4ff4-b648-5e28a41f19be" />


---


## Table of Contents

- [Project Overview](#-project-overview)
- [Application Screenshots](#-application-screenshots)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technologies Used](#-technologies-used)
- [Security Considerations](#-security-considerations)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation and Setup](#-installation-and-setup)
- [Testing](#-testing)
- [Academic Context](#-academic-context)

## Project Overview

Traditional electronic voting applications must protect voter identities, prevent unauthorized participation, and maintain the integrity of election results.

Proof-To-Vote explores how blockchain technology and smart contracts can support these requirements by moving essential voting-rule enforcement to an Ethereum-compatible blockchain.

The application combines blockchain-based verification with conventional backend and database components to manage the overall voting workflow.

The project focuses on three core principles:

- **Eligibility:** Voting actions should be restricted to eligible, authorized participants.
- **Integrity:** Smart contracts enforce voting rules and help prevent unauthorized modification of recorded voting state.
- **Transparency:** Blockchain transactions provide a verifiable record of on-chain operations.

Proof-To-Vote is an academic prototype demonstrating the integration of blockchain technology and cybersecurity principles in an electronic voting application. It is not presented as a certified or production-ready election platform.

## Application Screenshots

<img width="1280" height="498" alt="WhatsApp Image 2026-10-10 at 4 13 17 PM (1)" src="https://github.com/user-attachments/assets/3c35ed59-be20-4f35-9763-6f35fbad3e71" />
<img width="1280" height="618" alt="WhatsApp Image 2026-10-10 at 4 13 19 PM (1)" src="https://github.com/user-attachments/assets/2159727d-ac49-4776-8293-f66c84633b69" />

<img width="1280" height="336" alt="WhatsApp Image 2026-10-10 at 4 13 20 PM" src="https://github.com/user-attachments/assets/e6332f0e-06e6-428c-84b8-c3e6eb21cc3f" />
<img width="1280" height="634" alt="WhatsApp Image 2026-10-10 at 4 13 19 PM" src="https://github.com/user-attachments/assets/bf476eda-20fb-43ba-95c6-671a171383f4" />
<img width="1280" height="382" alt="WhatsApp Image 2026-10-10 at 4 13 21 PM" src="https://github.com/user-attachments/assets/c5cd92a3-6399-415d-932a-98d7229696f1" />



## Key Features

### 1. Blockchain-Based Voting

The voting functionality is implemented using Solidity smart contracts deployed to an Ethereum-compatible development network.

The blockchain layer is responsible for enforcing the voting rules implemented in the contracts and maintaining the corresponding on-chain state.

### 2. Voter Identity Verification

The system integrates MetaMask wallet addresses into the voter identification workflow.

A non-transferable voter identity NFT is used to associate an eligible voter with a blockchain identity. This mechanism is intended to support voter eligibility and identity management within the application.

### 3. Smart Contract Enforcement

The voting smart contract checks relevant conditions before accepting a voting action. These include voter eligibility and whether the voter has already voted, according to the implemented contract logic.

This helps prevent unauthorized voting actions and repeated votes within the scope of the implemented rules.

### 4. Administrative and Voter Roles

The application distinguishes between administrative and voter roles.

Administrative functionality supports management operations, while voter functionality supports the voting workflow. Access to protected operations depends on the application's implemented authorization controls.

### 5. Backend API Integration

A Python backend built with FastAPI connects application functionality with the relational database.

The API provides a structured interface for application operations and supports integration between the frontend and database components.

### 6. SQL Database Integration

MySQL is used for relational data storage. The database schema defines the application's required tables and associated data relationships.

The database complements the blockchain layer by supporting application data that is managed off-chain.

### 7. MetaMask Integration

MetaMask is used to connect a user's wallet to the blockchain environment and facilitate blockchain interactions.

Wallet-based interactions allow users to participate in supported blockchain operations through their connected account.

## System Architecture

Proof-To-Vote consists of several interacting components.

| Component | Responsibility |
|---|---|
| Frontend | Provides the user interface for application workflows. |
| MetaMask | Connects the user's wallet to the blockchain environment. |
| Solidity smart contracts | Implement voting rules and voter identity-related on-chain functionality. |
| Ethereum-compatible development network | Executes transactions and maintains blockchain state. |
| FastAPI backend | Exposes backend functionality and communicates with the database. |
| MySQL database | Stores application data in a relational structure. |

### High-Level Workflow

1. A user interacts with the application through the frontend.
2. The application uses the relevant backend functionality and/or MetaMask, depending on the operation.
3. The backend handles supported application and database operations.
4. Blockchain operations are submitted through the connected wallet and processed by the deployed smart contracts.
5. The smart contracts evaluate the applicable conditions and update on-chain state when the transaction is valid.
6. The application displays the relevant result to the user.

The blockchain and database serve different purposes: the blockchain handles implemented on-chain voting rules and state, while MySQL supports off-chain application data.

## Technologies Used

### Blockchain Development
- **Solidity** — Smart contract development.
- **Ethereum-compatible blockchain** — Execution of smart contract transactions.
- **Truffle** — Smart contract compilation, migration, and development workflow.
- **MetaMask** — Wallet connectivity and transaction authorization.

### Backend Development
- **Python** — Backend programming language.
- **FastAPI** — Backend API framework.
- **MySQL** — Relational database management system.

### Application Development
- **JavaScript** — Application logic and blockchain integration.
- **HTML and CSS** — Web interface technologies, where used by the frontend.
- **Node.js and npm** — JavaScript runtime and package management.

## Security Considerations

Security is an important aspect of Proof-To-Vote's design.

### Access Control

The application distinguishes between administrative and voter roles. Protected operations should be accessible only to authorized users, with permissions enforced by the appropriate application and backend controls.

### Voter Eligibility

The voter identity workflow uses wallet identities and a non-transferable identity NFT to support the association between eligible voters and their blockchain identities.

### Duplicate-Vote Prevention

The smart contract checks voting status before accepting a vote. This is intended to prevent the same eligible voter from submitting multiple accepted votes under the implemented rules.

### Transaction Integrity

Voting operations executed by the smart contract are recorded on the blockchain. The blockchain's transaction and state model helps protect accepted on-chain records against unauthorized alteration.

### Separation of On-Chain and Off-Chain Data

The project separates smart contract functionality from backend and SQL database operations. This separation allows each component to handle its intended responsibilities.

### Security Scope

These design mechanisms do not, by themselves, guarantee complete election security. Production deployment would require additional assessment of identity enrollment, wallet security, application vulnerabilities, administrator privileges, privacy, availability, smart contract correctness, and the integrity of the overall election process.

The project should be evaluated according to the security controls actually implemented and tested in its source code.

## Project Structure

The main source repository contains the following components:

- `contracts/` — Solidity smart contracts, including voting and voter identity functionality.
- `migrations/` — Truffle migration scripts used to deploy contracts.
- `test/` — Smart contract tests.
- `build/contracts/` — Generated contract artifacts.
- `Database_API/` — Python backend API and SQL-related database resources.
- `src/` — Frontend source code.
- `public/` — Public frontend assets.
- `index.js` — JavaScript application entry point.
- `package.json` — Node.js project dependencies and scripts.
- `truffle-config.js` — Truffle network and compiler configuration.
- `.gitignore` — Files and directories excluded from Git tracking.


## Prerequisites

Before running the project, prepare the following:

- Node.js and npm.
- Git.
- Python and pip.
- MySQL Server.
- Ganache or another compatible local Ethereum development network.
- MetaMask browser extension.
- Truffle, installed according to the project's dependency configuration.


## Installation and Setup

The following steps describe the main setup process. Exact commands may depend on the installed dependencies, package scripts, and database configuration.

### 1. Clone the Repository

Clone the repository from GitHub and navigate into the project directory.

### 2. Install JavaScript Dependencies

Install the dependencies defined in `package.json` using npm.

### 3. Configure the Blockchain Network

Start the local Ethereum development network and configure Truffle to use the appropriate RPC endpoint.

For the original local development setup, the expected Ganache endpoint is `http://127.0.0.1:7545`, with development network ID `1337`.

Configure MetaMask to use the matching local network and an appropriate development account.

### 4. Compile and Deploy the Smart Contracts

Use the project's Truffle configuration to compile the contracts and execute the required migrations.

Confirm that the contracts have been deployed successfully before attempting blockchain-related application operations.

### 5. Configure MySQL

Start MySQL Server and create the required database using the project's SQL schema.

Configure the backend database connection using local environment variables or another supported configuration method.

### 6. Configure and Start the Backend

Navigate to `Database_API/`, install the Python dependencies from `requirements.txt`, and configure the required environment variables.

Start the FastAPI application using the entry point and configuration supported by the project.

### 7. Start the Frontend

Install any required frontend dependencies and start the application using the appropriate script defined in `package.json`.

Ensure that the frontend, backend, database, MetaMask, and local blockchain network are configured consistently.

### 8. Verify the Application

Test the main workflows, including wallet connectivity, voter eligibility, administrative access, and the voting process. Verify that invalid or repeated voting actions are rejected as expected.

Refer to the project source and configuration files for any additional setup requirements.

##  Testing

Testing should cover the main application and smart contract workflows.

Suggested test areas include:

- Successful smart contract compilation and deployment.
- Valid voter eligibility checks.
- Rejection of unauthorized voting actions.
- Prevention of repeated accepted votes.
- Correct handling of administrative and voter roles.
- Backend API and database connectivity.
- Handling of invalid input and failed transactions.
- Frontend and MetaMask integration.

Only report tests as passed when they have actually been executed. The `test/` directory contains the project's available test resources.

## Academic Context

**Project Type:** Cybersecurity Graduation Project  
**Institution:** Arab Academy for Science, Technology and Maritime Transport (AASTMT)  
**Field of Study:** Cybersecurity  
**Academic Year:** 2025–2026

Proof-To-Vote was developed as an academic project to explore the application of blockchain technology, smart contracts, and cybersecurity principles to electronic voting.

The project demonstrates the integration of blockchain-based functionality with a conventional backend and relational database.



*Proof-To-Vote — Exploring blockchain-based electronic voting through cybersecurity*
