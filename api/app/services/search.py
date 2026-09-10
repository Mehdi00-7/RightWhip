import math

from sqlalchemy import func
from sqlalchemy.orm import Query as SAQuery
from sqlalchemy.orm import Session

from app.models import Listing


def build_listing_query(
    db: Session, *,
    make: str | None = None,
    price_min: int | None = None,
    price_max: int | None = None,
    year_min: int | None = None,
    year_max: int | None = None,
    mileage_max: int | None = None,
    fuel_type: str | None = None,
    transmission: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
    radius_km: float | None = None,
) -> SAQuery:
    query = db.query(Listing).filter(Listing.status == "published")

    if make:
        query = query.filter(Listing.make.ilike(make))
    if price_min is not None:
        query = query.filter(Listing.price >= price_min)
    if price_max is not None:
        query = query.filter(Listing.price <= price_max)
    if year_min is not None:
        query = query.filter(Listing.year >= year_min)
    if year_max is not None:
        query = query.filter(Listing.year <= year_max)
    if mileage_max is not None:
        query = query.filter(Listing.mileage <= mileage_max)
    if fuel_type:
        query = query.filter(Listing.fuel_type.ilike(fuel_type))
    if transmission:
        query = query.filter(Listing.transmission.ilike(transmission))

    if lat is not None and lng is not None and radius_km is not None:
        # Cheap bounding-box prefilter first — uses the indexes on
        # latitude/longitude, so it's fast even on a large table. This
        # narrows the row count *before* the expensive trig below runs.
        lat_delta = radius_km / 111.0
        lng_delta = radius_km / (111.0 * max(math.cos(math.radians(lat)), 0.01))

        query = query.filter(
            Listing.latitude.between(lat - lat_delta, lat + lat_delta),
            Listing.longitude.between(lng - lng_delta, lng + lng_delta),
        )

        # Haversine formula, computed in SQL, in kilometres. Clamp the acos
        # argument to [-1, 1] — floating point rounding can push it a hair
        # outside that range for near-identical points, which makes acos()
        # return NaN and the whole query blow up.
        cos_angle = (
            func.cos(func.radians(lat)) * func.cos(func.radians(Listing.latitude))
            * func.cos(func.radians(Listing.longitude) - func.radians(lng))
            + func.sin(func.radians(lat)) * func.sin(func.radians(Listing.latitude))
        )
        clamped = func.least(1.0, func.greatest(-1.0, cos_angle))
        distance_km = 6371 * func.acos(clamped)

        query = query.filter(distance_km <= radius_km).order_by(distance_km)

    return query
