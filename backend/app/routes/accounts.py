
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Account
from app.models.user import User
from app.core.auth import get_current_user

router = APIRouter(prefix="/accounts", tags=["Accounts"])


@router.get("/me")
def get_my_account(
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

    return {
        "account_number": account.account_number,
        "account_type": account.account_type,
        "balance": account.balance,
        "minimum_balance": account.minimum_balance,
        "status": account.status
    }
