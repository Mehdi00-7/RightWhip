from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Favourite, Listing, Seller
from app.schemas import ListingRead
from app.security import get_current_user

router = APIRouter(prefix="/listings", tags=["favourites"])


@router.post("/{listing_id}/favourite", status_code=201)
def add_favourite(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: Seller = Depends(get_current_user),
):
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")

    existing = (
        db.query(Favourite)
        .filter(Favourite.seller_id == current_user.id, Favourite.listing_id == listing_id)
        .first()
    )
    if existing:
        return {"detail": "Already favourited"}

    favourite = Favourite(seller_id=current_user.id, listing_id=listing_id)
    db.add(favourite)
    db.commit()
    return {"detail": "Favourited"}


@router.delete("/{listing_id}/favourite", status_code=204)
def remove_favourite(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: Seller = Depends(get_current_user),
):
    db.query(Favourite).filter(
        Favourite.seller_id == current_user.id, Favourite.listing_id == listing_id
    ).delete()
    db.commit()


favourites_router = APIRouter(prefix="/favourites", tags=["favourites"])


@favourites_router.get("", response_model=list[ListingRead])
def get_favourites(
    db: Session = Depends(get_db),
    current_user: Seller = Depends(get_current_user),
):
    return (
        db.query(Listing)
        .join(Favourite, Favourite.listing_id == Listing.id)
        .filter(Favourite.seller_id == current_user.id)
        .order_by(Favourite.created_at.desc())
        .all()
    )


@favourites_router.get("/ids", response_model=list[int])
def get_favourite_ids(
    db: Session = Depends(get_db),
    current_user: Seller = Depends(get_current_user),
):
    rows = db.query(Favourite.listing_id).filter(Favourite.seller_id == current_user.id).all()
    return [row[0] for row in rows]
