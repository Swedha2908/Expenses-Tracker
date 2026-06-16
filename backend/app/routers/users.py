from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas, auth, database

# Prefix all routes with /users
router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=schemas.UserResponse)
def get_user_profile(current_user: models.User = Depends(auth.get_current_user)):
    """
    Returns the profile information of the currently authenticated user.
    """
    return current_user