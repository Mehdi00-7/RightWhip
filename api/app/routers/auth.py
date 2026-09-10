from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Seller
from app.schemas import SellerCreate, SellerRead, Token, LoginRequest
from app.security import hash_password, verify_password, create_access_token

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


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    seller = db.query(Seller).filter(Seller.email == payload.email).first()
    if seller is None or not verify_password(payload.password, seller.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(seller.id)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24,
    )
    return Token(access_token=token)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"detail": "Logged out"}
