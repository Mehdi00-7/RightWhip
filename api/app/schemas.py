from datetime import datetime
from pydantic import BaseModel


class ListingCreate(BaseModel):
    make: str
    model: str
    variant: str 
    year: int
    price: int
    mileage: int
    fuel_type: str
    transmission: str
    body_type: str
    colour: str 
    engine_size: float 
    description: str | None = None
    postcode: str
    latitude: float | None = None
    longitude: float | None = None
    seller_id: int

class ListingRead(ListingCreate):
    id: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}