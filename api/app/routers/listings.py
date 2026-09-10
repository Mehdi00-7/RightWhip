from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from fastapi import Query

from app.db import get_db
from app.models import Listing,Seller
from app.schemas import ListingCreate, ListingRead, ListingDetailRead, ListingUpdate, PriceComparison
from typing import Literal
from app.services.search import build_listing_query
from app.services.pricing import get_comparables_stats, summarize_price, MIN_SAMPLE_SIZE
from app.services.geocoding import geocode_postcode
router = APIRouter(prefix="/listings", tags=["listings"])
from app.security import get_current_user

@router.post("", response_model=ListingRead, status_code=201)
def create_listing(
    payload: ListingCreate,
    db: Session = Depends(get_db),
    current_user: Seller = Depends(get_current_user),
):
    data = payload.model_dump(exclude={"seller_id"})

    # If the seller didn't drop a pin, derive coordinates from the postcode so
    # the listing still shows up on the map.
    if data.get("latitude") is None or data.get("longitude") is None:
        coords = geocode_postcode(data["postcode"])
        if coords:
            data["latitude"], data["longitude"] = coords

    listing = Listing(**data, seller_id=current_user.id)
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
    body_type: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
    radius_km: float | None = None,
    db: Session = Depends(get_db),
):
    query = build_listing_query(
        db, make=make, price_min=price_min, price_max=price_max,
        year_min=year_min, year_max=year_max, mileage_max=mileage_max,
        fuel_type=fuel_type, transmission=transmission, body_type=body_type,
        lat=lat, lng=lng, radius_km=radius_km,
    )

    # Radius search already orders by distance inside build_listing_query —
    # leave that as the authoritative order rather than overriding it below.
    is_radius_search = lat is not None and lng is not None and radius_km is not None

    if not is_radius_search:
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


@router.get("/{listing_id}", response_model=ListingDetailRead)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = (
        db.query(Listing)
        .options(joinedload(Listing.seller))
        .filter(Listing.id == listing_id)
        .first()
    )
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@router.get("/{listing_id}/price-comparison", response_model=PriceComparison)
def get_price_comparison(listing_id: int, db: Session = Depends(get_db)):
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")

    stats = get_comparables_stats(db, listing)
    n = stats["n"]

    # Statistical honesty: don't claim a signal we don't have enough data for.
    if n < MIN_SAMPLE_SIZE:
        return PriceComparison(sample_size=n)

    median = round(stats["median_price"])
    difference = listing.price - median

    return PriceComparison(
        sample_size=n,
        median_price=median,
        p25_price=round(stats["p25_price"]),
        p75_price=round(stats["p75_price"]),
        difference_from_median=difference,
        summary=summarize_price(listing, difference),
    )


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

    # Postcode changed without an explicit new pin — re-derive coordinates.
    if "postcode" in updates and "latitude" not in updates and "longitude" not in updates:
        coords = geocode_postcode(updates["postcode"])
        if coords:
            updates["latitude"], updates["longitude"] = coords

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


