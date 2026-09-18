import os
import uuid
import boto3
from fastapi import APIRouter, Depends, UploadFile, HTTPException

from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Listing, ListingImage, Seller
from app.schemas import ListingImageRead
from app.security import get_current_user

router = APIRouter(prefix="/listings", tags=["images"])

AWS_REGION = os.environ["AWS_REGION"]
AWS_S3_BUCKET = os.environ["AWS_S3_BUCKET"]
s3_client = boto3.client("s3", region_name=AWS_REGION)


@router.post("/{listing_id}/images", response_model=ListingImageRead, status_code=201)
async def upload_image(
    listing_id: int,
    file: UploadFile,
    db: Session = Depends(get_db),
    current_user: Seller = Depends(get_current_user),
):
    listing = db.get(Listing, listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your listing")

    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="File must be JPEG, PNG, or WebP")

    ext = file.filename.rsplit(".", 1)[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    contents = await file.read()

    s3_client.put_object(
        Bucket=AWS_S3_BUCKET,
        Key=filename,
        Body=contents,
        ContentType=file.content_type,
    )
    next_position = (
        db.query(ListingImage).filter(ListingImage.listing_id == listing_id).count()
    )
    image = ListingImage(
        listing_id=listing_id,
        url=f"https://{AWS_S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{filename}",
        position=next_position,
    )

    db.add(image)
    db.commit()
    db.refresh(image)
    return image
