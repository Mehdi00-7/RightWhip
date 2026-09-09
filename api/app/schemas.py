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
