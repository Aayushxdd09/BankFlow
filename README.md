# BankFlow – Full-Stack Banking Application

BankFlow is a full-stack banking application built using **React, FastAPI, PostgreSQL, and SQLAlchemy**. It provides secure user authentication, account management, deposits, withdrawals, money transfers, transaction history, financial summaries, and PDF bank statement generation.

The application includes a responsive frontend and a RESTful backend, with JWT-based authentication and database-backed transaction management.

## Features

### Authentication and Security
- User registration and login.
- JWT-based authentication.
- Secure password hashing.
- Password change functionality.
- Protected API endpoints.

### Account Management
- Automatic savings account creation during registration.
- Account details and balance display.
- Account status information.

### Banking Transactions
- Deposit money into an account.
- Withdraw money with minimum balance protection.
- Transfer money between accounts.
- Transaction validation and balance checks.
- Database transaction handling for financial operations.

### Dashboard and Transaction Management
- Account balance overview.
- Financial summary showing deposits, withdrawals, and transfers.
- Recent transaction activity.
- Transaction history with pagination and filtering.
- Transaction lookup using transaction reference.
- PDF bank statement generation.

### Frontend
- Login and registration pages.
- Banking dashboard.
- Deposit, withdrawal, and transfer interfaces.
- Account details page.
- Transaction history page.
- Responsive layouts for different screen sizes.

## Tech Stack

| Technology | Purpose |
|---|---|
| Python | Backend programming |
| FastAPI | REST API development |
| React | Frontend development |
| Vite | Frontend development server and build tool |
| JavaScript | Frontend logic |
| React Router | Client-side navigation |
| CSS | Frontend styling |
| PostgreSQL | Relational database |
| SQLAlchemy | ORM and database operations |
| Pydantic | Request validation |
| JWT | Authentication |
| Pytest | Automated backend testing |
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
| GET | `/accounts/me` | Get authenticated user's account details |

### Transactions

| Method | Endpoint | Description |
|---|---|---|
| POST | `/transactions/deposit` | Deposit money |
| POST | `/transactions/withdraw` | Withdraw money |
| POST | `/transactions/transfer` | Transfer money |
| GET | `/transactions/history` | View transaction history |
| GET | `/transactions/summary` | Get transaction summary |
| GET | `/transactions/statement` | Download PDF bank statement |
| GET | `/transactions/{transaction_reference}` | Get transaction details |

## Project Structure

```text
BankFlow/
│
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
│   │
│   ├── tests/
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Transactions.jsx
│   │   │   └── Account.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   │
│   ├── package.json
│   └── index.html
│
└── README.md
```

## Installation and Setup

### Prerequisites

Make sure you have installed:

- Python
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Aayushxdd09/BankFlow.git
cd BankFlow
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the backend directory:

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5433
DB_NAME=bankflow_db
SECRET_KEY=your_secret_key
```

Replace the values with your local PostgreSQL credentials and a securely generated secret key.

**Important:** Never commit your `.env` file or expose database credentials and secret keys on GitHub.

### 4. Run the Backend

From the backend directory, run:

```bash
uvicorn app.main:app --reload
```

The backend API will run at:

`http://127.0.0.1:8000`

### 5. Frontend Setup

Open a separate terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open the local frontend URL displayed in your terminal, usually:

`http://localhost:5173`

Make sure the backend and PostgreSQL database are running while using the frontend.

## API Documentation

Interactive Swagger documentation:

`http://127.0.0.1:8000/docs`

ReDoc documentation:

`http://127.0.0.1:8000/redoc`

## Running Automated Tests

Navigate to the backend directory, activate your virtual environment, and run:

```bash
python -m pytest -v
```

## Testing Status

- Automated backend tests: **7 passing**
- Manual application testing: Completed for registration, authentication, transactions, account activity, and PDF statement generation.
- Responsive layout testing: To be verified.

## Future Improvements

- Additional frontend and backend test coverage.
- Enhanced transaction filtering and reporting.
- Improved security and production configuration.
- Cloud deployment.
- Additional account management features.

## Disclaimer

BankFlow is an educational portfolio project developed to demonstrate full-stack development, REST API design, database management, authentication, and financial transaction workflows.

It is not intended for real banking or production financial transactions.
