from fastapi.testclient import TestClient


def test_list_drills_empty(client: TestClient) -> None:
    response = client.get("/api/drills")
    assert response.status_code == 200
    assert response.json() == []


def test_drill_crud_flow(client: TestClient) -> None:
    create = client.post(
        "/api/drills",
        json={
            "name": "Open-raise BTN",
            "description": "Practice BTN opens",
            "tags": "preflop",
        },
    )
    assert create.status_code == 201
    body = create.json()
    assert body["name"] == "Open-raise BTN"
    assert body["description"] == "Practice BTN opens"
    assert body["tags"] == "preflop"
    assert "id" in body
    drill_id = body["id"]

    listed = client.get("/api/drills")
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    one = client.get(f"/api/drills/{drill_id}")
    assert one.status_code == 200
    assert one.json()["id"] == drill_id

    patched = client.patch(
        f"/api/drills/{drill_id}",
        json={"name": "Open-raise BTN (updated)"},
    )
    assert patched.status_code == 200
    assert patched.json()["name"] == "Open-raise BTN (updated)"

    deleted = client.delete(f"/api/drills/{drill_id}")
    assert deleted.status_code == 204

    missing = client.get(f"/api/drills/{drill_id}")
    assert missing.status_code == 404

    list_after = client.get("/api/drills")
    assert list_after.json() == []


def test_get_drill_not_found(client: TestClient) -> None:
    response = client.get("/api/drills/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Drill not found"


def test_patch_drill_not_found(client: TestClient) -> None:
    response = client.patch("/api/drills/99999", json={"name": "x"})
    assert response.status_code == 404


def test_delete_drill_not_found(client: TestClient) -> None:
    response = client.delete("/api/drills/99999")
    assert response.status_code == 404
