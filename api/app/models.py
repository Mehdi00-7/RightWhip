from sqlalchemy import (
    Column, Integer, String, Float, Text, ForeignKey, DateTime, func
)
from sqlalchemy.orm import relationship

from app.db import Base


class Seller(Base):
    __tablename__ = "sellers"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    listings = relationship("Listing", back_populates="seller")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True)

    # core identity
    make = Column(String, nullable=False,index=True)
    model = Column(String, nullable=False)
    variant = Column(String, nullable=True)
    year = Column(Integer, nullable=False)

    # money & usage
    price = Column(Integer, nullable=False,index=True)
    mileage = Column(Integer, nullable=False)

    # spec
    fuel_type = Column(String, nullable=False)
    transmission = Column(String, nullable=False)
    body_type = Column(String, nullable=False)
    colour = Column(String, nullable=True)
    engine_size = Column(Float, nullable=True)
    description = Column(Text, nullable=True)

    # location
    postcode = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # meta
    seller_id = Column(Integer, ForeignKey("sellers.id"), nullable=False)
    status = Column(String, nullable=False, default="draft")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    seller = relationship("Seller", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing")


class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    url = Column(String, nullable=False)
    position = Column(Integer, nullable=False, default=0)

    listing = relationship("Listing", back_populates="images")
