from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi import Query

from app.db import get_db
from app.models import Listing
from app.schemas import ListingCreate, ListingRead

router = APIRouter(prefix="/listings", tags=["listings"])


@router.post("", response_model=ListingRead, status_code=201)
def create_listing(payload: ListingCreate, db: Session = Depends(get_db)):
    listing = Listing(**payload.model_dump())
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing

@router.get("",response_model=list[ListingRead])
def get_listings(limit: int=Query(24,ge=1, le=100),offset: int=Query(0,ge=0), db: Session=Depends(get_db)):
    return (
        db.query(Listing)
        .order_by(Listing.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/{listing_id}", response_model=ListingRead)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


