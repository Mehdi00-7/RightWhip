from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import SavedSearch, Seller
from app.schemas import SavedSearchCreate, SavedSearchRead
from app.security import get_current_user

router = APIRouter(prefix="/saved-searches", tags=["saved-searches"])


@router.post("", response_model=SavedSearchRead, status_code=201)
def create_saved_search(
    payload: SavedSearchCreate,
    db: Session = Depends(get_db),
    current_user: Seller = Depends(get_current_user),
):
    saved = SavedSearch(seller_id=current_user.id, name=payload.name, filters=payload.filters)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved


@router.get("", response_model=list[SavedSearchRead])
def list_saved_searches(
    db: Session = Depends(get_db),
    current_user: Seller = Depends(get_current_user),
):
    return (
        db.query(SavedSearch)
        .filter(SavedSearch.seller_id == current_user.id)
        .order_by(SavedSearch.created_at.desc())
        .all()
    )


@router.delete("/{search_id}", status_code=204)
def delete_saved_search(
    search_id: int,
    db: Session = Depends(get_db),
    current_user: Seller = Depends(get_current_user),
):
    saved = db.get(SavedSearch, search_id)
    if saved is None:
        raise HTTPException(status_code=404, detail="Saved search not found")
    if saved.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your saved search")

    db.delete(saved)
    db.commit()
