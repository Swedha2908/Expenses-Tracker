import traceback
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from . import models, schemas, auth, database
from .routers import transactions
from .routers import transactions, users
from .database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router)
app.include_router(transactions.router)
app.include_router(users.router)


@app.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    try:
        print(f"\n--- STARTING REGISTRATION FOR: {user.email} ---")

        # 1. Check if user already exists
        if db.query(models.User).filter(models.User.email == user.email).first():
            raise HTTPException(status_code=400, detail="Email already registered")

        # 2. Hash the password
        print("Step 1 Complete: Hashing password...")
        hashed_password = auth.get_password_hash(user.password)

        # 3. Save to database
        print("Step 2 Complete: Saving to MySQL database...")
        new_user = models.User(
            name=user.name, email=user.email, password_hash=hashed_password
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # 4. Generate token
        print("Step 3 Complete: REGISTRATION SUCCESSFUL!")
        access_token = auth.create_access_token(data={"sub": new_user.email})
        return {"access_token": access_token, "token_type": "bearer"}

    except Exception as e:
        print("\n!!! SERVER CRASHED DURING REGISTRATION !!!")
        traceback.print_exc()  # This forces Python to print the exact error traceback!
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
):

    # --- ADD THESE TWO LINES FOR DEBUGGING ---
    print(f"DEBUG - Username: {form_data.username}")
    print(f"DEBUG - Password received from frontend: '{form_data.password}'")
    # -----------------------------------------

    user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
