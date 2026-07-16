import pytest
from email_validator import EmailNotValidError
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.users import User, UserRole
from tests.conftest import login, signup


def test_user_model_rejects_non_email_username() -> None:
    with pytest.raises(EmailNotValidError):
        User(
            username="not-an-email",
            first_name="Bad",
            last_name="Input",
            hashed_password="hashed",
        )


def test_new_user_defaults_to_free_role(client: TestClient) -> None:
    body = signup(client, "freeuser@example.com")
    assert body["role"] == "free"


def test_list_users_requires_authentication(client: TestClient) -> None:
    response = client.get("/users/")
    assert response.status_code == 401


def test_list_users_forbidden_for_free_tier_user(client: TestClient) -> None:
    signup(client, "freeuser@example.com")
    token = login(client, "freeuser@example.com")

    response = client.get("/users/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


def test_list_users_allowed_for_admin(client: TestClient, db_session: Session) -> None:
    signup(client, "adminuser@example.com")
    user = db_session.query(User).filter_by(username="adminuser@example.com").one()
    user.role = UserRole.ADMIN
    db_session.commit()

    token = login(client, "adminuser@example.com")

    response = client.get("/users/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_delete_account_requires_authentication(client: TestClient) -> None:
    response = client.request("DELETE", "/users/me", json={"password": "password123"})
    assert response.status_code == 401


def test_delete_account_rejects_wrong_password(
    client: TestClient, db_session: Session
) -> None:
    signup(client, "deleteme@example.com")
    token = login(client, "deleteme@example.com")

    response = client.request(
        "DELETE",
        "/users/me",
        json={"password": "wrong-password"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 401
    assert (
        db_session.query(User).filter_by(username="deleteme@example.com").count() == 1
    )


def test_delete_account_removes_the_user(
    client: TestClient, db_session: Session
) -> None:
    signup(client, "deleteme@example.com")
    token = login(client, "deleteme@example.com")

    response = client.request(
        "DELETE",
        "/users/me",
        json={"password": "password123"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 204
    assert (
        db_session.query(User).filter_by(username="deleteme@example.com").count() == 0
    )

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 401


def test_delete_account_cascades_preflop_responses(
    client: TestClient, db_session: Session
) -> None:
    from app.models.preflop import PreflopResponse

    signup(client, "deleteme@example.com")
    token = login(client, "deleteme@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    create = client.post(
        "/preflop-responses/",
        json={
            "seed": 1,
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
            "actions": [],
        },
        headers=headers,
    )
    assert create.status_code == 201

    response = client.request(
        "DELETE", "/users/me", json={"password": "password123"}, headers=headers
    )
    assert response.status_code == 204
    assert db_session.query(PreflopResponse).count() == 0
