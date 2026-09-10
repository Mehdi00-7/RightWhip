from app.services.search import build_listing_query


def test_filters_by_make(db_session, seller_factory, listing_factory):
    seller = seller_factory()
    listing_factory(seller, make="Ford")
    listing_factory(seller, make="BMW")

    results = build_listing_query(db_session, make="Ford").all()

    assert len(results) == 1
    assert results[0].make == "Ford"


def test_make_filter_is_case_insensitive(db_session, seller_factory, listing_factory):
    seller = seller_factory()
    listing_factory(seller, make="Ford")

    results = build_listing_query(db_session, make="ford").all()

    assert len(results) == 1


def test_price_range_filter(db_session, seller_factory, listing_factory):
    seller = seller_factory()
    listing_factory(seller, price=500000)   # £5,000 — below range
    listing_factory(seller, price=1500000)  # £15,000 — in range
    listing_factory(seller, price=2500000)  # £25,000 — above range

    results = build_listing_query(db_session, price_min=800000, price_max=2000000).all()

    assert len(results) == 1
    assert results[0].price == 1500000


def test_price_min_zero_is_not_treated_as_no_filter(db_session, seller_factory, listing_factory):
    # Regression test: `if price_min:` would silently ignore price_min=0,
    # since 0 is falsy in Python. The real filter uses `is not None`.
    seller = seller_factory()
    listing_factory(seller, price=100000)

    results = build_listing_query(db_session, price_min=0).all()

    assert len(results) == 1


def test_year_range_filter(db_session, seller_factory, listing_factory):
    seller = seller_factory()
    listing_factory(seller, year=2015)
    listing_factory(seller, year=2020)
    listing_factory(seller, year=2024)

    results = build_listing_query(db_session, year_min=2018, year_max=2022).all()

    assert len(results) == 1
    assert results[0].year == 2020


def test_mileage_max_filter(db_session, seller_factory, listing_factory):
    seller = seller_factory()
    listing_factory(seller, mileage=10000)
    listing_factory(seller, mileage=90000)

    results = build_listing_query(db_session, mileage_max=50000).all()

    assert len(results) == 1
    assert results[0].mileage == 10000


def test_fuel_type_and_transmission_filters(db_session, seller_factory, listing_factory):
    seller = seller_factory()
    listing_factory(seller, fuel_type="diesel", transmission="automatic")
    listing_factory(seller, fuel_type="petrol", transmission="manual")

    results = build_listing_query(db_session, fuel_type="diesel", transmission="automatic").all()

    assert len(results) == 1
    assert results[0].fuel_type == "diesel"


def test_body_type_filter(db_session, seller_factory, listing_factory):
    seller = seller_factory()
    listing_factory(seller, body_type="suv")
    listing_factory(seller, body_type="saloon")

    results = build_listing_query(db_session, body_type="suv").all()

    assert len(results) == 1
    assert results[0].body_type == "suv"


def test_draft_listings_are_never_returned(db_session, seller_factory, listing_factory):
    seller = seller_factory()
    listing_factory(seller, status="draft")
    listing_factory(seller, status="published")

    results = build_listing_query(db_session).all()

    assert len(results) == 1
    assert results[0].status == "published"


def test_no_filters_returns_all_published(db_session, seller_factory, listing_factory):
    seller = seller_factory()
    listing_factory(seller)
    listing_factory(seller)

    results = build_listing_query(db_session).all()

    assert len(results) == 2


def test_radius_search_excludes_far_away_listings(db_session, seller_factory, listing_factory):
    seller = seller_factory()
    listing_factory(seller, latitude=53.4808, longitude=-2.2426)  # Manchester
    listing_factory(seller, latitude=51.5074, longitude=-0.1278)  # London, ~260km away

    results = build_listing_query(db_session, lat=53.4808, lng=-2.2426, radius_km=10).all()

    assert len(results) == 1
