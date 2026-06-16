from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TransactionBase(BaseModel):
    type: str
    category: str
    amount: float
    description: Optional[str] = None
    transaction_date: datetime

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Add this below your existing schemas in app/schemas.py

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime
    
    class Config:
        from_attributes = True        