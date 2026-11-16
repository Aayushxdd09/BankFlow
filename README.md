# BankFlow – Banking Application

A backend banking application built using **FastAPI, PostgreSQL, and SQLAlchemy**. BankFlow provides secure authentication, account management, financial transactions, transaction history, and account statement generation.

## Features

- **User Authentication** – Register, login, and JWT-based authentication.
- **Password Security** – Secure password hashing and password change functionality.
- **Account Management** – Automatically creates a savings account during registration.
- **Deposits & Withdrawals** – Supports balance updates with minimum balance protection.
- **Money Transfers** – Transfer funds between accounts with transactional integrity.
- **Transaction History** – View transaction records with pagination and filtering.
- **Transaction Summary** – View balance and transaction totals.
- **Transaction Lookup** – Retrieve transaction details using transaction reference.
- **PDF Bank Statements** – Download account statements in PDF format.
- **Automated Testing** – Tests authentication and transaction functionality using Pytest.
- **API Documentation** – Interactive API documentation through Swagger UI.

## Tech Stack

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| FastAPI | REST API development |
| PostgreSQL | Relational database |
| SQLAlchemy | ORM and database operations |
| Pydantic | Request validation |
| JWT | Authentication |
| Pytest | Automated testing |
| ReportLab | PDF statement generation |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT |
| GET | `/auth/me` | Get authenticated user |
| POST | `/auth/change-password` | Change password |

### Accounts

| Method | Endpoint | Description |
|---|---|---|
| GET | `/accounts/me` | Get account details |

### Transactions

| Method | Endpoint | Description |
|---|---|---|
| POST | `/transactions/deposit` | Deposit money |
| POST | `/transactions/withdraw` | Withdraw money |
| POST | `/transactions/transfer` | Transfer money |
| GET | `/transactions/history` | View transaction history |
| GET | `/transactions/summary` | Get transaction summary |
| GET | `/transactions/statement` | Download PDF statement |
| GET | `/transactions/{transaction_reference}` | Get transaction details |

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Aayushxdd09/BankFlow.git
cd BankFlow/backend
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it:

**Windows:**
```powershell
.\venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file inside the backend directory:

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5433
DB_NAME=bankflow_db
SECRET_KEY=your_secret_key
```

Replace the values with your local PostgreSQL credentials and a secure secret key.

### 5. Run the application

```bash
uvicorn app.main:app --reload
```

The API will run at:

`http://127.0.0.1:8000`

## API Documentation

Swagger UI:

`http://127.0.0.1:8000/docs`

ReDoc:

`http://127.0.0.1:8000/redoc`

## Running Tests

Run the automated test suite:

```bash
python -m pytest -v
```

## Project Structure

```text
BankFlow/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── database.py
│   │   ├── main.py
│   │   └── security.py
│   ├── tests/
│   ├── requirements.txt
│   └── .env
└── README.md
```

## Testing Status

Current automated tests: **7 passing**

## Disclaimer

BankFlow is an educational portfolio project and is not intended for real banking or production financial transactions.
