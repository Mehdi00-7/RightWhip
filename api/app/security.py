from passlib.context import CryptContext
import os
from datetime import datetime, timedelta, timezone
from jose import jwt

from fastapi import Depends, HTTPException, Request
from jose import JWTError
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Seller

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24


def create_access_token(seller_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {"sub": str(seller_id), "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)



def get_current_user(request: Request, db: Session = Depends(get_db)) -> Seller:
    token = request.cookies.get("access_token")
    if token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        seller_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")

    seller = db.get(Seller, seller_id)
    if seller is None:
        raise HTTPException(status_code=401, detail="Seller not found")

    return seller
