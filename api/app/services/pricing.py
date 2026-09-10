from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models import Listing

MIN_SAMPLE_SIZE = 5


def get_comparables_stats(db: Session, listing: Listing) -> dict:
    """
    Comparables: same make + model, year within ±2, mileage within ±20%,
    excluding the listing itself. percentile_cont is Postgres' proper
    percentile aggregate — no need to pull rows into Python and sort them.
    """
    row = db.execute(
        text("""
            SELECT
                count(*) AS n,
                percentile_cont(0.5) WITHIN GROUP (ORDER BY price) AS median_price,
                percentile_cont(0.25) WITHIN GROUP (ORDER BY price) AS p25_price,
                percentile_cont(0.75) WITHIN GROUP (ORDER BY price) AS p75_price
            FROM listings
            WHERE make = :make
              AND model = :model
              AND year BETWEEN :year_low AND :year_high
              AND mileage BETWEEN :mileage_low AND :mileage_high
              AND status = 'published'
              AND id != :listing_id
        """),
        {
            "make": listing.make,
            "model": listing.model,
            "year_low": listing.year - 2,
            "year_high": listing.year + 2,
            "mileage_low": listing.mileage * 0.8,
            "mileage_high": listing.mileage * 1.2,
            "listing_id": listing.id,
        },
    ).mappings().first()

    return dict(row) if row else {"n": 0, "median_price": None, "p25_price": None, "p75_price": None}


def summarize_price(listing: Listing, difference: int) -> str | None:
    """Optional natural-language phrasing of the raw numbers (10.5). Never
    lets a failure here break the price comparison itself — the numeric
    badge is the part that matters; this is a nice-to-have on top."""
    try:
        from app.services.nl_search import _get_client

        pounds = abs(difference) // 100
        direction = "below" if difference < 0 else "above"

        response = _get_client().chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[{
                "role": "user",
                "content": (
                    f"Write one short, natural sentence (max 12 words) saying this "
                    f"{listing.year} {listing.make} {listing.model} is priced "
                    f"£{pounds} {direction} similar listings. No preamble, just the sentence."
                ),
            }],
            temperature=0.3,
            # gpt-oss is a reasoning model — it "thinks" in a separate
            # channel before writing the visible answer, so max_tokens has
            # to cover both, not just the short sentence itself.
            max_tokens=200,
        )
        content = response.choices[0].message.content.strip()
        return content or None
    except Exception:
        return None
