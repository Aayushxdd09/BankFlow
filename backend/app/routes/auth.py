
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import User, Account
from app.schemas.user import UserCreate, UserResponse
from app.security import hash_password, verify_password, create_access_token
from app.core.auth import get_current_user
from app.schemas.user import ChangePasswordRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])


def generate_account_number():
    return str(secrets.randbelow(900000000000) + 100000000000)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        (User.email == user_data.email) |
        (User.phone == user_data.phone)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email or phone already registered"
        )

    try:
        new_user = User(
            full_name=user_data.full_name,
            email=user_data.email,
            phone=user_data.phone,
            password_hash=hash_password(user_data.password)
        )

        db.add(new_user)
        db.flush()

        new_account = Account(
            account_number=generate_account_number(),
            account_type="SAVINGS",
            balance=0,
            minimum_balance=1000,
            status="ACTIVE",
            user_id=new_user.id
        )

        db.add(new_account)
        db.commit()
        db.refresh(new_user)

        return new_user

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Email, phone or account number already exists"
        )

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Registration failed"
        )


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == form_data.username
    ).first()

    if not user or not verify_password(
        form_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone
    }

@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(
        data.current_password,
        current_user.password_hash
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    current_user.password_hash = hash_password(data.new_password)

    db.commit()

    return {"message": "Password changed successfully"}