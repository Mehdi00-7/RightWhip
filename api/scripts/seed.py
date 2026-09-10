import random
from datetime import datetime

from app.db import SessionLocal
from app.models import Seller, Listing, ListingImage
from app.security import hash_password
from scripts.car_images import CAR_IMAGES

# Seeded sellers all share this password so the deployed demo is explorable
# (log in, view dashboard, post/publish). Documented in the README.
DEMO_PASSWORD = "demo1234"

SELLER_COUNT = 20
LISTINGS_PER_MODEL = 20   # keeps price-comparison samples healthy


# make, model, body_type, fuel, new_price_in_pence
CARS = [
    ("Volkswagen", "Golf",      "hatchback", "petrol", 2800000),
    ("Volkswagen", "Passat",    "estate",    "diesel", 3400000),
    ("Ford",       "Fiesta",    "hatchback", "petrol", 1900000),
    ("Ford",       "Focus",     "hatchback", "petrol", 2400000),
    ("BMW",        "3 Series",  "saloon",    "diesel", 4200000),
    ("BMW",        "X3",        "suv",       "diesel", 5100000),
    ("Toyota",     "Corolla",   "hatchback", "hybrid", 2600000),
    ("Toyota",     "RAV4",      "suv",       "hybrid", 3800000),
    ("Audi",       "A3",        "hatchback", "petrol", 3100000),
    ("Nissan",     "Qashqai",   "suv",       "petrol", 2900000),
    ("Vauxhall",   "Corsa",     "hatchback", "petrol", 1800000),
    ("Tesla",      "Model 3",   "saloon",    "electric", 4500000),
]
# city, postcode prefix, lat, lng
CITIES = [
    ("Manchester", "M1",  53.4808, -2.2426),
    ("London",     "E1",  51.5074, -0.1278),
    ("Birmingham", "B1",  52.4862, -1.8904),
    ("Leeds",      "LS1", 53.8008, -1.5491),
    ("Glasgow",    "G1",  55.8642, -4.2518),
    ("Bristol",    "BS1", 51.4545, -2.5879),
]


def make_listing(seller_id, car):
    make, model, body, fuel, new_price = car
    year = random.randint(2015, 2024)
    age = datetime.now().year - year

    # depreciate ~17% per year
    price = new_price * (0.83 ** age)

    # mileage: ~10k/year, with variation
    expected_miles = age * 10000
    mileage = int(expected_miles * random.uniform(0.6, 1.4)) + random.randint(0, 5000)

    # extra penalty for above-average mileage
    excess = mileage - expected_miles
    price *= (1 - (excess / 10000) * 0.03)

    # random noise so prices aren't a perfect formula
    price *= random.uniform(0.93, 1.07)
    price = max(int(price), 90000)          # floor at £900
    price = round(price / 5000) * 5000      # round to the nearest £50, like real ads

    city, postcode_prefix, lat, lng = random.choice(CITIES)

    listing = Listing(
        make=make,
        model=model,
        year=year,
        price=price,
        mileage=mileage,
        fuel_type=fuel,
        transmission="automatic" if fuel == "electric" else random.choice(["manual", "automatic"]),
        body_type=body,
        colour=random.choice(["black", "white", "silver", "blue", "red", "grey"]),
        engine_size=None if fuel == "electric" else random.choice([1.0, 1.4, 1.6, 2.0, 2.5]),
        postcode=f"{postcode_prefix} {random.randint(1,9)}{random.choice('ABDEFG')}{random.choice('ABDEFG')}",
        latitude=lat + random.uniform(-0.08, 0.08),
        longitude=lng + random.uniform(-0.08, 0.08),
        seller_id=seller_id,
        status="published",
    )

    photos = CAR_IMAGES.get((make, model), [])
    for i, url in enumerate(random.sample(photos, k=min(len(photos), random.choice([1, 2, 2])))):
        listing.images.append(ListingImage(url=url, position=i))

    return listing


SEED_EMAIL_LIKE = "seller%@example.com"


def main():
    db = SessionLocal()
    try:
        # Idempotent: bail if the demo listings are already there. Checks the
        # seed's own data specifically, so it's independent of anything a
        # visitor posts. Exits 0 so it's safe to leave in the start command.
        already = (
            db.query(Listing)
            .join(Seller, Listing.seller_id == Seller.id)
            .filter(Seller.email.like(SEED_EMAIL_LIKE))
            .count()
        )
        if already:
            print(f"already seeded ({already} demo listings) — nothing to do.")
            return

        pw_hash = hash_password(DEMO_PASSWORD)
        sellers = []
        for i in range(SELLER_COUNT):
            email = f"seller{i+1}@example.com"
            # A previous half-finished run may have created the sellers but not
            # the listings — reuse them rather than colliding on the unique email.
            seller = db.query(Seller).filter_by(email=email).first()
            if seller is None:
                seller = Seller(name=f"Seller {i+1}", email=email, password_hash=pw_hash)
                db.add(seller)
            sellers.append(seller)
        db.commit()
        for seller in sellers:
            db.refresh(seller)

        listings = [
            make_listing(random.choice(sellers).id, car)
            for car in CARS
            for _ in range(LISTINGS_PER_MODEL)
        ]
        random.shuffle(listings)   # so the first page isn't all one model
        db.add_all(listings)
        db.commit()

        print(f"generated {len(listings)} listings from {SELLER_COUNT} sellers")
        print(f"demo login: seller1@example.com / {DEMO_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
