
from fastapi import FastAPI
from sqlalchemy import text

from app.database import engine, Base
from app.models import User, Account
from app.models.transaction import Transaction
from app.routes.transactions import router as transactions_router
from app.routes.auth import router as auth_router

from app.routes.accounts import router as accounts_router

from app.database import engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BankFlow API",
    description="Banking Management System",
    version="1.0.0"
)
app.include_router(auth_router)
app.include_router(accounts_router)
app.include_router(transactions_router)

@app.get("/")
def home():
    return {"message": "BankFlow API is running"}

@app.get("/health/database")
def database_health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {"database": "connected"}
