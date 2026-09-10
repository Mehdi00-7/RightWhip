from datetime import datetime
from pydantic import BaseModel


class ListingCreate(BaseModel):
    make: str
    model: str
    variant: str | None = None
    year: int | None = None
    price: int
    mileage: int
    fuel_type: str
    transmission: str
    body_type: str
    colour: str 
    engine_size: float | None = None
    description: str | None = None
    postcode: str
    latitude: float | None = None
    longitude: float | None = None
    


class ListingImageRead(BaseModel):
    id: int
    listing_id: int
    url: str
    position: int

    model_config = {"from_attributes": True}

class ListingRead(ListingCreate):
    id: int
    status: str
    created_at: datetime
    seller_id: int
    images: list[ListingImageRead] = []

    model_config = {"from_attributes": True}

class SellerCreate(BaseModel):
    name: str
    email: str
    password: str


class SellerRead(BaseModel):
    id: int
    name: str
    email: str

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: str
    password: str


class ListingUpdate(BaseModel):
    make: str | None = None
    model: str | None = None
    variant: str | None = None
    year: int | None = None
    price: int | None = None
    mileage: int | None = None
    fuel_type: str | None = None
    transmission: str | None = None
    body_type: str | None = None
    colour: str | None = None
    engine_size: float | None = None
    description: str | None = None
    postcode: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    status: str | None = None


class FavouriteRead(BaseModel):
    id: int
    listing_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class SavedSearchCreate(BaseModel):
    name: str | None = None
    filters: dict


class SavedSearchRead(BaseModel):
    id: int
    name: str | None
    filters: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class NLSearchRequest(BaseModel):
    query: str


# What we ask the LLM to produce. Deliberately NOT the same shape as the
# API filters below — price is in whole pounds here, because trusting an
# LLM to correctly multiply by 100 is asking for trouble. The conversion
# to pence happens in Python, not in the model's head.
class RawNLFilters(BaseModel):
    make: str | None = None
    price_max_gbp: int | None = None
    price_min_gbp: int | None = None
    year_min: int | None = None
    mileage_max: int | None = None
    fuel_type: str | None = None
    transmission: str | None = None
    body_type: str | None = None


# The validated, API-ready shape — same field names/units as GET /listings'
# query params, so the frontend can pass this straight through unchanged.
class PriceComparison(BaseModel):
    sample_size: int
    median_price: int | None = None
    p25_price: int | None = None
    p75_price: int | None = None
    difference_from_median: int | None = None  # negative = priced below market
    summary: str | None = None


class NLSearchFilters(BaseModel):
    make: str | None = None
    price_max: int | None = None
    price_min: int | None = None
    year_min: int | None = None
    mileage_max: int | None = None
    fuel_type: str | None = None
    transmission: str | None = None
    body_type: str | None = None
