from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Seller
from app.schemas import SellerCreate, SellerRead
from app.security import hash_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=SellerRead, status_code=201)
def register(payload: SellerCreate, db: Session = Depends(get_db)):
    existing = db.query(Seller).filter(Seller.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    seller = Seller(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(seller)
    db.commit()
    db.refresh(seller)
    return seller
