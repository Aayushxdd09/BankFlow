
from pydantic import BaseModel, Field
from decimal import Decimal


class DepositRequest(BaseModel):
    amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2
    )

    description: str | None = None


class WithdrawalRequest(BaseModel):
    amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2
    )

    description: str | None = None


class TransferRequest(BaseModel):
    receiver_account_number: str = Field(
        min_length=12,
        max_length=12
    )

    amount: Decimal = Field(
        gt=0,
        max_digits=15,
        decimal_places=2
    )

    description: str | None = None
