from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app.dependencies.rate_limit import RateLimit


def make_client(limit: RateLimit) -> TestClient:
    app = FastAPI()

    @app.get("/limited", dependencies=[Depends(limit)])
    def limited():
        return {"ok": True}

    return TestClient(app)


def test_allows_requests_up_to_the_limit():
    client = make_client(RateLimit(limit=3, window_seconds=60))

    for _ in range(3):
        assert client.get("/limited").status_code == 200


def test_rejects_requests_over_the_limit_with_retry_after():
    client = make_client(RateLimit(limit=2, window_seconds=60))
    client.get("/limited")
    client.get("/limited")

    response = client.get("/limited")

    assert response.status_code == 429
    assert 0 < int(response.headers["Retry-After"]) <= 60


def test_limits_each_client_separately():
    limit = RateLimit(limit=1, window_seconds=60)
    client = make_client(limit)
    assert client.get("/limited").status_code == 200
    assert client.get("/limited").status_code == 429

    other = TestClient(client.app, client=("10.0.0.2", 50000))
    assert other.get("/limited").status_code == 200


def test_allows_requests_again_after_the_window(monkeypatch):
    now = [1000.0]
    monkeypatch.setattr("app.dependencies.rate_limit.time.monotonic", lambda: now[0])
    client = make_client(RateLimit(limit=1, window_seconds=60))
    assert client.get("/limited").status_code == 200
    assert client.get("/limited").status_code == 429

    now[0] += 60

    assert client.get("/limited").status_code == 200
