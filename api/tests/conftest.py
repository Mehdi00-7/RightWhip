import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db import Base, get_db
from app.models import Seller, Listing
from app.security import get_current_user

TEST_DATABASE_URL = "postgresql://autotrail:autotrail_dev@localhost:5432/autotrail_test"

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def authed_client(db_session, seller_factory):
    """A TestClient whose requests are authenticated as a freshly created
    seller. Yields (client, seller) so tests can assert on ownership."""
    seller = seller_factory()

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: seller
    with TestClient(app) as test_client:
        yield test_client, seller
    app.dependency_overrides.clear()


@pytest.fixture
def seller_factory(db_session):
    """Returns a function so each test can create as many sellers as it
    needs, each with a unique email (sellers.email is unique-constrained)."""
    counter = {"n": 0}

    def make(**overrides):
        counter["n"] += 1
        defaults = dict(
            name="Test Seller",
            email=f"seller{counter['n']}@example.com",
            password_hash="not-a-real-hash",
        )
        defaults.update(overrides)
        seller = Seller(**defaults)
        db_session.add(seller)
        db_session.commit()
        db_session.refresh(seller)
        return seller

    return make


@pytest.fixture
def listing_factory(db_session):
    """Sensible defaults for every NOT NULL column, so a test only has to
    specify the fields it actually cares about."""
    def make(seller, **overrides):
        defaults = dict(
            make="Ford", model="Fiesta", year=2020, price=1000000, mileage=30000,
            fuel_type="petrol", transmission="manual", body_type="hatchback",
            colour="blue", postcode="M1 1AA", seller_id=seller.id, status="published",
        )
        defaults.update(overrides)
        listing = Listing(**defaults)
        db_session.add(listing)
        db_session.commit()
        db_session.refresh(listing)
        return listing

    return make
