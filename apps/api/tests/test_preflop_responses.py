from fastapi.testclient import TestClient

from tests.conftest import login, signup


def _valid_payload(**overrides) -> dict:
    payload = {
        "seed": 12345,
        "table_size": 6,
        "hero_position": "BTN",
        "hero_stack_bb": "100",
        "small_blind_bb": "0.5",
        "big_blind_bb": "1",
        "ante_bb": "0",
        "hero_card_1": "As",
        "hero_card_2": "Kh",
        "move": "raise",
        "raise_size_bb": "2.5",
        "verdict": "correct",
        "explanation": "Standard BTN open.",
        "recommended_move": "raise",
        "recommended_raise_size_bb": "2.5",
        "actions": [
            {"position": "UTG", "action_type": "fold", "size_bb": None},
            {"position": "CO", "action_type": "fold", "size_bb": None},
        ],
    }
    payload.update(overrides)
    return payload


def _auth_headers(client: TestClient, username: str = "trainee@example.com") -> dict:
    signup(client, username)
    token = login(client, username)
    return {"Authorization": f"Bearer {token}"}


def test_create_response_requires_authentication(client: TestClient) -> None:
    response = client.post("/preflop-responses/", json=_valid_payload())
    assert response.status_code == 401


def test_create_response_persists_actions_in_order(client: TestClient) -> None:
    headers = _auth_headers(client)

    response = client.post(
        "/preflop-responses/", json=_valid_payload(), headers=headers
    )
    assert response.status_code == 201
    body = response.json()
    assert body["hero_position"] == "BTN"
    assert body["move"] == "raise"
    assert [a["position"] for a in body["actions"]] == ["UTG", "CO"]
    assert [a["sequence"] for a in body["actions"]] == [0, 1]


def test_create_response_rejects_raise_without_size(client: TestClient) -> None:
    headers = _auth_headers(client)

    response = client.post(
        "/preflop-responses/",
        json=_valid_payload(move="raise", raise_size_bb=None),
        headers=headers,
    )
    assert response.status_code == 422


def test_list_responses_scoped_to_current_user(client: TestClient) -> None:
    headers_a = _auth_headers(client, "usera@example.com")
    headers_b = _auth_headers(client, "userb@example.com")

    client.post("/preflop-responses/", json=_valid_payload(), headers=headers_a)
    client.post("/preflop-responses/", json=_valid_payload(), headers=headers_b)

    response = client.get("/preflop-responses/", headers=headers_a)
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_get_response_not_found_for_other_users(client: TestClient) -> None:
    headers_a = _auth_headers(client, "usera@example.com")
    headers_b = _auth_headers(client, "userb@example.com")

    created = client.post(
        "/preflop-responses/", json=_valid_payload(), headers=headers_a
    ).json()

    own_lookup = client.get(f"/preflop-responses/{created['id']}", headers=headers_a)
    assert own_lookup.status_code == 200

    other_lookup = client.get(f"/preflop-responses/{created['id']}", headers=headers_b)
    assert other_lookup.status_code == 404
