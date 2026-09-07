import os
import uuid

from fastapi import APIRouter, Depends, UploadFile, HTTPException

from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Listing, ListingImage
from app.schemas import ListingImageRead

router = APIRouter(prefix="/listings", tags=["images"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/{listing_id}/images", response_model=ListingImageRead, status_code=201)
async def upload_image(
    listing_id: int, file: UploadFile, db: Session = Depends(get_db)
):
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")

    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="File must be JPEG, PNG, or WebP")

    ext = file.filename.rsplit(".", 1)[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        f.write(await file.read())

    image = ListingImage(listing_id=listing_id, url=f"/uploads/{filename}", position=0)
    db.add(image)
    db.commit()
    db.refresh(image)
    return image
