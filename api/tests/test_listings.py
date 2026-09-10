"""Listing endpoint behaviour: seller contact on the detail view, postcode
geocoding on create, and image-upload ownership."""

import io

import httpx
import pytest

from app.services import geocoding


def test_detail_endpoint_includes_seller_contact(client, seller_factory, listing_factory):
    seller = seller_factory(name="Dave Motors", email="dave@example.com")
    listing = listing_factory(seller)

    body = client.get(f"/listings/{listing.id}").json()

    assert body["seller"]["name"] == "Dave Motors"
    assert body["seller"]["email"] == "dave@example.com"
    assert "password_hash" not in body["seller"]


def test_list_endpoint_does_not_include_seller(client, seller_factory, listing_factory):
    seller = seller_factory()
    listing_factory(seller)

    body = client.get("/listings").json()

    assert "seller" not in body[0]


@pytest.fixture
def stub_geocoder(monkeypatch):
    calls = []

    def fake(postcode):
        calls.append(postcode)
        return (51.5, -0.12)

    monkeypatch.setattr("app.routers.listings.geocode_postcode", fake)
    return calls


def _listing_payload(**overrides):
    payload = dict(
        make="Ford", model="Focus", year=2020, price=1200000, mileage=25000,
        fuel_type="petrol", transmission="manual", body_type="hatchback",
        colour="blue", postcode="SW1A 1AA",
    )
    payload.update(overrides)
    return payload


def test_create_geocodes_postcode_when_no_pin(authed_client, stub_geocoder):
    client, _ = authed_client

    body = client.post("/listings", json=_listing_payload()).json()

    assert stub_geocoder == ["SW1A 1AA"]
    assert body["latitude"] == 51.5
    assert body["longitude"] == -0.12


def test_create_keeps_explicit_pin_and_skips_geocoding(authed_client, stub_geocoder):
    client, _ = authed_client

    body = client.post(
        "/listings", json=_listing_payload(latitude=53.0, longitude=-1.0)
    ).json()

    assert stub_geocoder == []  # not called
    assert body["latitude"] == 53.0
    assert body["longitude"] == -1.0


def test_image_upload_rejected_for_non_owner(authed_client, seller_factory, listing_factory):
    client, _ = authed_client
    someone_else = seller_factory()
    listing = listing_factory(someone_else)

    res = client.post(
        f"/listings/{listing.id}/images",
        files={"file": ("car.jpg", io.BytesIO(b"fake"), "image/jpeg")},
    )

    assert res.status_code == 403


def test_image_upload_accepted_for_owner(authed_client, listing_factory, monkeypatch, tmp_path):
    monkeypatch.setattr("app.routers.images.UPLOAD_DIR", str(tmp_path))
    client, seller = authed_client
    listing = listing_factory(seller)

    res = client.post(
        f"/listings/{listing.id}/images",
        files={"file": ("car.jpg", io.BytesIO(b"fake"), "image/jpeg")},
    )

    assert res.status_code == 201
    assert res.json()["position"] == 0
    assert len(list(tmp_path.iterdir())) == 1  # written to the temp dir, not the repo


def test_deleting_a_listing_with_images_succeeds(authed_client, listing_factory, monkeypatch, tmp_path):
    # Regression: without cascade on Listing.images, this 500s on the FK.
    monkeypatch.setattr("app.routers.images.UPLOAD_DIR", str(tmp_path))
    client, seller = authed_client
    listing = listing_factory(seller)
    client.post(
        f"/listings/{listing.id}/images",
        files={"file": ("car.jpg", io.BytesIO(b"fake"), "image/jpeg")},
    )

    res = client.delete(f"/listings/{listing.id}")

    assert res.status_code == 204
    assert client.get(f"/listings/{listing.id}").status_code == 404
