from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi import Query

from app.db import get_db
from app.models import Listing,Seller
from app.schemas import ListingCreate, ListingRead, ListingUpdate
from typing import Literal
from app.services.search import build_listing_query
router = APIRouter(prefix="/listings", tags=["listings"])
from app.security import get_current_user

@router.post("", response_model=ListingRead, status_code=201)
def create_listing(
    payload: ListingCreate,
    db: Session = Depends(get_db),
    current_user: Seller = Depends(get_current_user),
):
    listing = Listing(**payload.model_dump(exclude={"seller_id"}), seller_id=current_user.id)
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


@router.get("", response_model=list[ListingRead])
def get_listings(
    limit: int = Query(24, ge=1, le=100),
    offset: int = Query(0, ge=0),
    sort: Literal["newest", "price_asc", "price_desc", "mileage_asc"] = "newest",
    make: str | None = None,
    price_min: int | None = None,
    price_max: int | None = None,
    year_min: int | None = None,
    year_max: int | None = None,
    mileage_max: int | None = None,
    fuel_type: str | None = None,
    transmission: str | None = None,
    db: Session = Depends(get_db),
):
    query = build_listing_query(
        db, make=make, price_min=price_min, price_max=price_max,
        year_min=year_min, year_max=year_max, mileage_max=mileage_max,
        fuel_type=fuel_type, transmission=transmission,
    )

    if sort == "price_asc":
        query = query.order_by(Listing.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Listing.price.desc())
    elif sort == "mileage_asc":
        query = query.order_by(Listing.mileage.asc())
    else:
        query = query.order_by(Listing.created_at.desc())

    return query.offset(offset).limit(limit).all()


@router.get("/mine", response_model=list[ListingRead])
def get_my_listings(
    db: Session = Depends(get_db),
    current_user: Seller = Depends(get_current_user),
):
    return (
        db.query(Listing)
        .filter(Listing.seller_id == current_user.id)
        .order_by(Listing.created_at.desc())
        .all()
    )


@router.get("/{listing_id}", response_model=ListingRead)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@router.patch("/{listing_id}", response_model=ListingRead)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: Seller = Depends(get_current_user),
):
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your listing")

    updates = payload.model_dump(exclude_unset=True)
    if updates.get("status") == "published" and listing.status != "published":
        from datetime import datetime, timezone
        listing.published_at = datetime.now(timezone.utc)

    for field, value in updates.items():
        setattr(listing, field, value)

    db.commit()
    db.refresh(listing)
    return listing


@router.delete("/{listing_id}", status_code=204)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: Seller = Depends(get_current_user),
):
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your listing")

    db.delete(listing)
    db.commit()


