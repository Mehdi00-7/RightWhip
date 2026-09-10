from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import NLSearchRequest, NLSearchFilters
from app.services.nl_search import parse_nl_query

router = APIRouter(prefix="/search", tags=["search"])


@router.post("/nl", response_model=NLSearchFilters)
def natural_language_search(payload: NLSearchRequest, db: Session = Depends(get_db)):
    try:
        return parse_nl_query(db, payload.query)
    except ValidationError:
        # The model didn't return valid JSON matching our schema — fall
        # back to "no filters understood" rather than a 500. The frontend
        # falls back to the manual filter sidebar in this case.
        return NLSearchFilters()
    except Exception:
        raise HTTPException(status_code=502, detail="AI search is unavailable right now — try the filters instead")
