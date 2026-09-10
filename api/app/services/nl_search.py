import os

from groq import Groq
from sqlalchemy.orm import Session

from app.models import Listing
from app.schemas import RawNLFilters, NLSearchFilters

_client: Groq | None = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=os.environ["GROQ_API_KEY"])
    return _client


SYSTEM_PROMPT = """You convert a car buyer's natural language search into structured filters.

Respond with ONLY a JSON object, no other text. Valid fields (all optional — omit any that don't apply):
- make: string, must be one of: {makes}
- price_max_gbp: integer, maximum price in whole pounds (not pence)
- price_min_gbp: integer, minimum price in whole pounds
- year_min: integer, oldest acceptable year
- mileage_max: integer, maximum mileage
- fuel_type: one of: {fuel_types}
- transmission: one of: {transmissions}
- body_type: one of: {body_types}

Domain guidance:
- "family car", "practical", "spacious" -> body_type "estate" or "suv" (pick the closer match)
- "sporty", "hot hatch" -> body_type "hatchback"
- "cheap", "budget", "affordable" with no number given -> do not guess a number, omit price_max_gbp
- "low mileage" with no number given -> omit mileage_max rather than guessing
- "reliable" is not a filterable field — ignore it, don't map it to anything
- Only include a field if the query actually implies it. An empty object {{}} is a valid response for a vague query.

Example query: "reliable family car under 15k, low mileage, automatic"
Example response: {{"price_max_gbp": 15000, "transmission": "automatic", "body_type": "estate"}}
"""


def parse_nl_query(db: Session, query: str) -> NLSearchFilters:
    makes = [row[0] for row in db.query(Listing.make).distinct().all()]
    fuel_types = [row[0] for row in db.query(Listing.fuel_type).distinct().all()]
    transmissions = [row[0] for row in db.query(Listing.transmission).distinct().all()]
    body_types = [row[0] for row in db.query(Listing.body_type).distinct().all()]

    system = SYSTEM_PROMPT.format(
        makes=", ".join(makes),
        fuel_types=", ".join(fuel_types),
        transmissions=", ".join(transmissions),
        body_types=", ".join(body_types),
    )

    client = _get_client()
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": query},
        ],
        response_format={"type": "json_object"},
        temperature=0,
    )

    raw = RawNLFilters.model_validate_json(response.choices[0].message.content)

    # Never trust model output straight into a query. Validate case-
    # insensitively (the DB filters use ILIKE downstream anyway), and drop
    # anything that doesn't match real data rather than silently returning
    # zero results for a hallucinated make/fuel type/body type.
    makes_lower = {m.lower() for m in makes}
    fuel_types_lower = {f.lower() for f in fuel_types}
    transmissions_lower = {t.lower() for t in transmissions}
    body_types_lower = {b.lower() for b in body_types}

    make = raw.make if raw.make and raw.make.lower() in makes_lower else None
    fuel_type = raw.fuel_type if raw.fuel_type and raw.fuel_type.lower() in fuel_types_lower else None
    transmission = (
        raw.transmission if raw.transmission and raw.transmission.lower() in transmissions_lower else None
    )
    body_type = raw.body_type if raw.body_type and raw.body_type.lower() in body_types_lower else None

    return NLSearchFilters(
        make=make,
        price_max=raw.price_max_gbp * 100 if raw.price_max_gbp is not None else None,
        price_min=raw.price_min_gbp * 100 if raw.price_min_gbp is not None else None,
        year_min=raw.year_min,
        mileage_max=raw.mileage_max,
        fuel_type=fuel_type,
        transmission=transmission,
        body_type=body_type,
    )
