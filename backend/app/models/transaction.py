
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    transaction_reference = Column(
        String(50),
        
        nullable=False,
        index=True
    )

    transaction_type = Column(String(20), nullable=False)

    amount = Column(Numeric(12, 2), nullable=False)

    status = Column(String(20), default="SUCCESS", nullable=False)

    description = Column(String(255), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    account_id = Column(
        Integer,
        ForeignKey("accounts.id"),
        nullable=False
    )

    account = relationship("Account", back_populates="transactions")
