
from sqlalchemy import (
    Integer,
    String,
    Numeric,
    ForeignKey,
    DateTime,
    func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    account_number: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False, index=True
    )

    account_type: Mapped[str] = mapped_column(
        String(20), default="SAVINGS", nullable=False
    )

    balance: Mapped[float] = mapped_column(
        Numeric(15, 2), default=0, nullable=False
    )

    minimum_balance: Mapped[float] = mapped_column(
        Numeric(15, 2), default=1000, nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20), default="ACTIVE", nullable=False
    )

    created_at = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )

    owner = relationship("User", back_populates="accounts")
    transactions = relationship(
        "Transaction",
        back_populates="account"
    )   
