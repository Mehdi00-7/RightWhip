from sqlalchemy.orm import Query as SAQuery
from app.models import Listing
from sqlalchemy.orm import Session



def build_listing_query(
    db: Session,*,
    make: str | None = None,
    price_min: int | None = None,
    price_max: int | None = None,
    year_min: int | None = None,
    year_max: int | None = None,
    mileage_max: int | None = None,
    fuel_type: str | None = None,
    transmission: str | None = None
)-> SAQuery:
    query = db.query(Listing).filter(Listing.status == "published")

    if make:
        query=query.filter(Listing.make.ilike(make))
    if price_min is not None:
        query=query.filter(Listing.price >= price_min)
    if price_max is not None:
        query=query.filter(Listing.price<=price_max)
    if year_min is not None:
        query=query.filter(Listing.year >= year_min)
    if year_max is not None:
        query=query.filter(Listing.year <= year_max)
    if mileage_max is not None:
        query=query.filter(Listing.mileage <= mileage_max)
    if fuel_type:
        query=query.filter(Listing.fuel_type.ilike(fuel_type))
    if transmission:
        query=query.filter(Listing.transmission.ilike(transmission))

    return query