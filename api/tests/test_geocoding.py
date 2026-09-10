import httpx
import pytest

from app.services import geocoding


def _mock_transport(handler):
    """Point geocode_postcode's httpx.Client at an in-memory handler."""
    return httpx.MockTransport(handler)


@pytest.fixture
def patch_client(monkeypatch):
    def install(handler):
        real_client = httpx.Client

        def factory(*args, **kwargs):
            kwargs["transport"] = _mock_transport(handler)
            return real_client(*args, **kwargs)

        monkeypatch.setattr(geocoding.httpx, "Client", factory)

    return install


def test_resolves_full_postcode(patch_client):
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/postcodes/M1 1AA"
        return httpx.Response(200, json={"result": {"latitude": 53.4771, "longitude": -2.2299}})

    patch_client(handler)
    assert geocoding.geocode_postcode("M1 1AA") == (53.4771, -2.2299)


def test_falls_back_to_outcode_when_full_lookup_fails(patch_client):
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path.startswith("/postcodes/"):
            return httpx.Response(404, json={"error": "Postcode not found"})
        assert request.url.path == "/outcodes/M1"
        return httpx.Response(200, json={"result": {"latitude": 53.48, "longitude": -2.24}})

    patch_client(handler)
    assert geocoding.geocode_postcode("M1 9ZZ") == (53.48, -2.24)


def test_returns_none_when_nothing_resolves(patch_client):
    patch_client(lambda request: httpx.Response(404, json={}))
    assert geocoding.geocode_postcode("NOT A POSTCODE") is None


def test_returns_none_on_network_error(patch_client):
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("boom")

    patch_client(handler)
    assert geocoding.geocode_postcode("M1 1AA") is None


def test_blank_postcode_short_circuits():
    assert geocoding.geocode_postcode("") is None
    assert geocoding.geocode_postcode(None) is None
