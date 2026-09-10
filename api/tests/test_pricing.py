from app.services.pricing import get_comparables_stats, MIN_SAMPLE_SIZE


def test_finds_comparables_with_similar_year_and_mileage(db_session, seller_factory, listing_factory):
    seller = seller_factory()
    target = listing_factory(seller, year=2020, mileage=30000, price=1000000)
    listing_factory(seller, year=2021, mileage=32000, price=1100000)  # within ±2 years, ±20% mileage
    listing_factory(seller, year=2019, mileage=28000, price=900000)   # within range

    stats = get_comparables_stats(db_session, target)

    assert stats["n"] == 2


def test_excludes_listing_from_its_own_comparables(db_session, seller_factory, listing_factory):
    seller = seller_factory()
    target = listing_factory(seller, year=2020, mileage=30000)

    stats = get_comparables_stats(db_session, target)

    assert stats["n"] == 0  # only itself exists, and it's excluded by id


def test_excludes_listings_outside_year_range(db_session, seller_factory, listing_factory):
    seller = seller_factory()
    target = listing_factory(seller, year=2020, mileage=30000)
    listing_factory(seller, year=2015, mileage=30000)  # 5 years off, outside ±2

    stats = get_comparables_stats(db_session, target)

    assert stats["n"] == 0


def test_excludes_listings_outside_mileage_range(db_session, seller_factory, listing_factory):
    seller = seller_factory()
    target = listing_factory(seller, year=2020, mileage=30000)
    listing_factory(seller, year=2020, mileage=100000)  # way outside ±20%

    stats = get_comparables_stats(db_session, target)

    assert stats["n"] == 0


def test_excludes_different_model(db_session, seller_factory, listing_factory):
    seller = seller_factory()
    target = listing_factory(seller, model="Fiesta", year=2020, mileage=30000)
    listing_factory(seller, model="Focus", year=2020, mileage=30000)

    stats = get_comparables_stats(db_session, target)

    assert stats["n"] == 0


def test_median_price_is_correct(db_session, seller_factory, listing_factory):
    seller = seller_factory()
    target = listing_factory(seller, year=2020, mileage=30000, price=1000000)
    listing_factory(seller, year=2020, mileage=30000, price=900000)
    listing_factory(seller, year=2020, mileage=30000, price=1100000)

    stats = get_comparables_stats(db_session, target)

    assert stats["n"] == 2
    assert stats["median_price"] == 1000000  # median of [900000, 1100000]


def test_price_comparison_endpoint_suppressed_below_min_sample(client, seller_factory, listing_factory):
    seller = seller_factory()
    target = listing_factory(seller, year=2020, mileage=30000)
    listing_factory(seller, year=2020, mileage=30000)  # only 1 comparable — below MIN_SAMPLE_SIZE

    response = client.get(f"/listings/{target.id}/price-comparison")

    assert response.status_code == 200
    body = response.json()
    assert body["sample_size"] < MIN_SAMPLE_SIZE
    assert body["median_price"] is None


def test_price_comparison_endpoint_shows_badge_with_enough_samples(client, seller_factory, listing_factory):
    seller = seller_factory()
    target = listing_factory(seller, year=2020, mileage=30000, price=1000000)
    for _ in range(5):
        listing_factory(seller, year=2020, mileage=30000, price=1000000)

    response = client.get(f"/listings/{target.id}/price-comparison")

    assert response.status_code == 200
    body = response.json()
    assert body["sample_size"] >= MIN_SAMPLE_SIZE
    assert body["median_price"] is not None
    assert body["difference_from_median"] == 0
