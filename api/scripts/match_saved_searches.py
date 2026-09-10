"""
Checks each saved search against listings created since it was last checked.
Run manually or on a schedule (cron/systemd timer). Prints matches instead of
sending real notifications, since this project has no email/SMTP setup.
"""

from datetime import datetime, timezone

from app.db import SessionLocal
from app.models import Listing, SavedSearch
from app.services.search import build_listing_query


def main():
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        searches = db.query(SavedSearch).all()

        for search in searches:
            matches = (
                build_listing_query(db, **search.filters)
                .filter(Listing.published_at.isnot(None))
                .filter(Listing.published_at > search.last_checked_at)
                .all()
            )

            if matches:
                print(f"Saved search #{search.id} ('{search.name or 'unnamed'}'): "
                      f"{len(matches)} new match(es)")
                for listing in matches:
                    print(f"  - {listing.year} {listing.make} {listing.model} "
                          f"£{listing.price / 100:.0f} (id={listing.id})")

            search.last_checked_at = now

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    main()
