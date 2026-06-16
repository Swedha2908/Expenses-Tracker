from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth, database
from datetime import datetime

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/", response_model=schemas.TransactionResponse)
def create_transaction(
    transaction: schemas.TransactionCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    db_transaction = models.Transaction(
        **transaction.model_dump(), user_id=current_user.id
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


@router.get("/", response_model=List[schemas.TransactionResponse])
def get_transactions(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return (
        db.query(models.Transaction)
        .filter(models.Transaction.user_id == current_user.id)
        .all()
    )


@router.put("/{id}", response_model=schemas.TransactionResponse)
def update_transaction(
    id: int,
    transaction: schemas.TransactionCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    # 1. Find the existing transaction
    query = db.query(models.Transaction).filter(
        models.Transaction.id == id, models.Transaction.user_id == current_user.id
    )
    db_transaction = query.first()

    # 2. If it doesn't exist, raise an error
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # 3. Update the fields
    query.update(transaction.model_dump(), synchronize_session=False)
    db.commit()
    db.refresh(db_transaction)

    return db_transaction


@router.delete("/{id}")
def delete_transaction(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    query = db.query(models.Transaction).filter(
        models.Transaction.id == id, models.Transaction.user_id == current_user.id
    )
    if not query.first():
        raise HTTPException(status_code=404, detail="Transaction not found")
    query.delete(synchronize_session=False)
    db.commit()
    return {"message": "Transaction deleted"}


@router.get("/dashboard")
def get_dashboard_summary(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    transactions = (
        db.query(models.Transaction)
        .filter(models.Transaction.user_id == current_user.id)
        .all()
    )

    total_income = sum(t.amount for t in transactions if t.type == "Income")
    total_expense = sum(t.amount for t in transactions if t.type == "Expense")
    balance = total_income - total_expense
    savings_pct = (balance / total_income * 100) if total_income > 0 else 0

    # Category Breakdown for Pie Chart
    categories = {}
    for t in transactions:
        if t.type == "Expense":
            categories[t.category] = categories.get(t.category, 0) + t.amount

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "savings_percentage": round(savings_pct, 2),
        "category_distribution": categories,
    }
