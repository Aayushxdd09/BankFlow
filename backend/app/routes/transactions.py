
import secrets
from decimal import Decimal

from io import BytesIO
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle
)
from fastapi.responses import StreamingResponse

from fastapi import Query

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.database import get_db
from app.models import Account
from app.models.transaction import Transaction
from app.models.user import User
from app.core.auth import get_current_user
from app.schemas.transaction import DepositRequest
from app.schemas.transaction import WithdrawalRequest
from app.schemas.transaction import TransferRequest
from sqlalchemy import func

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


@router.post("/deposit")
def deposit_money(
    deposit: DepositRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        account = db.query(Account).filter(
            Account.user_id == current_user.id
        ).with_for_update().first()

        if not account:
            raise HTTPException(
                status_code=404,
                detail="Account not found"
            )

        if account.status != "ACTIVE":
            raise HTTPException(
                status_code=400,
                detail="Account is not active"
            )

        amount = deposit.amount

        account.balance = Decimal(account.balance) + amount

        transaction = Transaction(
            transaction_reference=f"TXN-{secrets.token_hex(8).upper()}",
            transaction_type="DEPOSIT",
            amount=amount,
            status="SUCCESS",
            description=deposit.description or "Money deposited",
            account_id=account.id
        )

        db.add(transaction)
        db.commit()
        db.refresh(account)
        db.refresh(transaction)

        return {
            "message": "Deposit successful",
            "transaction_reference": transaction.transaction_reference,
            "amount": transaction.amount,
            "balance": account.balance
        }

    except HTTPException:
        db.rollback()
        raise

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Deposit failed"
        )


@router.post("/withdraw")
def withdraw_money(
    withdrawal: WithdrawalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        account = db.query(Account).filter(
            Account.user_id == current_user.id
        ).with_for_update().first()

        if not account:
            raise HTTPException(
                status_code=404,
                detail="Account not found"
            )

        if account.status != "ACTIVE":
            raise HTTPException(
                status_code=400,
                detail="Account is not active"
            )

        amount = withdrawal.amount
        current_balance = Decimal(account.balance)
        minimum_balance = Decimal(account.minimum_balance)

        if current_balance - amount < minimum_balance:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient balance. Minimum balance of {minimum_balance} must be maintained."
            )

        account.balance = current_balance - amount

        transaction = Transaction(
            transaction_reference=f"TXN-{secrets.token_hex(8).upper()}",
            transaction_type="WITHDRAWAL",
            amount=amount,
            status="SUCCESS",
            description=withdrawal.description or "Money withdrawn",
            account_id=account.id
        )

        db.add(transaction)
        db.commit()

        db.refresh(account)
        db.refresh(transaction)

        return {
            "message": "Withdrawal successful",
            "transaction_reference": transaction.transaction_reference,
            "amount": transaction.amount,
            "balance": account.balance
        }

    except HTTPException:
        db.rollback()
        raise

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Withdrawal failed"
        )




from sqlalchemy import func


@router.post("/transfer")
def transfer_money(
    transfer: TransferRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Find sender account
        sender = db.query(Account).filter(
            Account.user_id == current_user.id
        ).first()

        if not sender:
            raise HTTPException(status_code=404, detail="Sender account not found")

        # Find receiver account
        receiver = db.query(Account).filter(
            Account.account_number == transfer.receiver_account_number
        ).first()

        if not receiver:
            raise HTTPException(status_code=404, detail="Receiver account not found")

        if sender.id == receiver.id:
            raise HTTPException(status_code=400, detail="Cannot transfer to your own account")

        # Lock both accounts in consistent order
        accounts = db.query(Account).filter(
            Account.id.in_([sender.id, receiver.id])
        ).order_by(Account.id).with_for_update().all()

        account_map = {account.id: account for account in accounts}
        sender = account_map[sender.id]
        receiver = account_map[receiver.id]

        # Check account status
        if sender.status != "ACTIVE" or receiver.status != "ACTIVE":
            raise HTTPException(status_code=400, detail="Both accounts must be active")

        amount = transfer.amount

        # Check minimum balance
        if sender.balance - amount < sender.minimum_balance:
            raise HTTPException(
                status_code=400,
                detail="Insufficient balance"
            )

        # Update balances
        sender.balance -= amount
        receiver.balance += amount

        # Shared transaction reference
        reference = f"TXN-{secrets.token_hex(8).upper()}"

        # Sender transaction
        sender_transaction = Transaction(
            transaction_reference=reference,
            transaction_type="TRANSFER",
            amount=amount,
            status="SUCCESS",
            description=f"Transfer to {receiver.account_number}",
            account_id=sender.id
        )

        # Receiver transaction
        receiver_transaction = Transaction(
            transaction_reference=reference,
            transaction_type="TRANSFER",
            amount=amount,
            status="SUCCESS",
            description=f"Received from {sender.account_number}",
            account_id=receiver.id
        )

        db.add_all([sender_transaction, receiver_transaction])
        db.commit()

        db.refresh(sender)
        db.refresh(receiver)

        return {
            "message": "Transfer successful",
            "transaction_reference": reference,
            "amount": amount,
            "sender_balance": sender.balance,
            "receiver_balance": receiver.balance
        }

    except HTTPException:
        db.rollback()
        raise

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Transfer failed")


@router.get("/history")
def get_transaction_history(
    page: int = 1,
    page_size: int = 5,
    transaction_type: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if page < 1:
        raise HTTPException(status_code=400, detail="Page must be >= 1")

    if page_size < 1 or page_size > 100:
        raise HTTPException(
            status_code=400,
            detail="Page size must be between 1 and 100"
        )

    account = db.query(Account).filter(
        Account.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    query = db.query(Transaction).filter(
        Transaction.account_id == account.id
    )

    if transaction_type:
        transaction_type = transaction_type.upper()

        if transaction_type not in ["DEPOSIT", "WITHDRAWAL", "TRANSFER"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid transaction type"
            )

        query = query.filter(
            Transaction.transaction_type == transaction_type
        )

    total_transactions = query.count()

    total_pages = (
        (total_transactions + page_size - 1) // page_size
    if total_transactions > 0 else 0
    )

    transactions = query.order_by(
        Transaction.created_at.desc(),
        Transaction.id.desc()
    ).offset(
        (page - 1) * page_size
    ).limit(page_size).all()

    return {
        "page": page,
        "page_size": page_size,
        "total_transactions": total_transactions,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1,
        "transactions": [
            {
                "id": txn.id,
                "transaction_reference": txn.transaction_reference,
                "transaction_type": txn.transaction_type,
                "amount": txn.amount,
                "status": txn.status,
                "description": txn.description,
                "created_at": txn.created_at,
                "account_id": txn.account_id
            }
            for txn in transactions
        ]
    }


@router.get("/summary")
def transaction_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = db.query(Account).filter(
        Account.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )

    transactions = db.query(Transaction).filter(
        Transaction.account_id == account.id
    ).all()

    total_deposits = sum(
        (t.amount for t in transactions
         if t.transaction_type == "DEPOSIT"),
        Decimal("0")
    )

    total_withdrawals = sum(
        (t.amount for t in transactions
         if t.transaction_type == "WITHDRAWAL"),
        Decimal("0")
    )

    total_transfers_sent = sum(
        (t.amount for t in transactions
         if t.transaction_type == "TRANSFER"
         and not (t.description or "").startswith("Received from")),
        Decimal("0")
    )

    total_transfers_received = sum(
        (t.amount for t in transactions
         if t.transaction_type == "TRANSFER"
         and (t.description or "").startswith("Received from")),
        Decimal("0")
    )

    return {
        "account_number": account.account_number,
        "current_balance": account.balance,
        "total_deposits": total_deposits,
        "total_withdrawals": total_withdrawals,
        "total_transfers_sent": total_transfers_sent,
        "total_transfers_received": total_transfers_received,
        "total_transactions": len(transactions)
    }



@router.get("/statement")
def download_statement(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = db.query(Account).filter(
        Account.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )

    transactions = db.query(Transaction).filter(
        Transaction.account_id == account.id
    ).order_by(
        Transaction.created_at.asc(),
        Transaction.id.asc()
    ).all()

    buffer = BytesIO()

    pdf = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("BANKFLOW BANK", styles["Title"]))
    elements.append(Paragraph("Account Statement", styles["Heading2"]))
    elements.append(Spacer(1, 15))

    elements.append(Paragraph(
        f"Account Number: {account.account_number}",
        styles["Normal"]
    ))

    elements.append(Paragraph(
        f"Account Type: {account.account_type}",
        styles["Normal"]
    ))

    elements.append(Paragraph(
        f"Account Holder: {current_user.full_name}",
        styles["Normal"]
    ))

    elements.append(Paragraph(
        f"Statement Generated: {datetime.now().strftime('%d-%m-%Y %H:%M')}",
        styles["Normal"]
    ))

    elements.append(Spacer(1, 20))

    data = [
        ["Date", "Reference", "Type", "Amount (INR)", "Status"]
    ]

    for txn in transactions:
        data.append([
            txn.created_at.strftime("%d-%m-%Y") if txn.created_at else "-",
            txn.transaction_reference,
            txn.transaction_type,
            f"{txn.amount:.2f}",
            txn.status
        ])

    table = Table(
        data,
        repeatRows=1,
        colWidths=[65, 145, 75, 85, 65]
    )

    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#163A5F")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ALIGN", (3, 1), (3, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 20))

    elements.append(Paragraph(
        f"Current Balance: INR {account.balance:.2f}",
        styles["Heading3"]
    ))

    pdf.build(elements)

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f"attachment; filename=BankFlow_Statement_{account.account_number}.pdf"
        }
    )


@router.get("/{transaction_reference}")
def get_transaction_by_reference(
    transaction_reference: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    account = db.query(Account).filter(
        Account.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )

    transaction = db.query(Transaction).filter(
        Transaction.transaction_reference == transaction_reference,
        Transaction.account_id == account.id
    ).first()

    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    return {
        "id": transaction.id,
        "transaction_reference": transaction.transaction_reference,
        "transaction_type": transaction.transaction_type,
        "amount": transaction.amount,
        "status": transaction.status,
        "description": transaction.description,
        "created_at": transaction.created_at
    }
