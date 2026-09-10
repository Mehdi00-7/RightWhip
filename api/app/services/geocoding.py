import httpx

POSTCODES_IO = "https://api.postcodes.io"


def _coords_from_result(payload: dict) -> tuple[float, float] | None:
    result = payload.get("result") or {}
    # /outcodes returns a list-free object; /postcodes too. Both use these keys.
    lat, lng = result.get("latitude"), result.get("longitude")
    if lat is not None and lng is not None:
        return float(lat), float(lng)
    return None


def geocode_postcode(postcode: str | None) -> tuple[float, float] | None:
    """Resolve a UK postcode to (latitude, longitude) via postcodes.io.

    Free, no API key, UK-only. Tries the full postcode first, then falls
    back to the outward code (e.g. "M1" from "M1 1AA") so a slightly-off or
    partial postcode still lands in roughly the right place. Returns None on
    any failure — callers treat missing coordinates as acceptable, not fatal.
    """
    postcode = (postcode or "").strip()
    if not postcode:
        return None

    try:
        with httpx.Client(timeout=5.0) as client:
            res = client.get(f"{POSTCODES_IO}/postcodes/{postcode}")
            if res.status_code == 200:
                coords = _coords_from_result(res.json())
                if coords:
                    return coords

            outcode = postcode.split()[0]
            res = client.get(f"{POSTCODES_IO}/outcodes/{outcode}")
            if res.status_code == 200:
                coords = _coords_from_result(res.json())
                if coords:
                    return coords
    except (httpx.HTTPError, ValueError):
        return None

    return None
