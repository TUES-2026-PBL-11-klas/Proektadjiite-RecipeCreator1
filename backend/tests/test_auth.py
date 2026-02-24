def test_register_success(client):
    resp = client.post("/api/auth/register", json={
        "email": "new@example.com",
        "username": "newuser",
        "password": "pass123",
    })
    assert resp.status_code == 201
    data = resp.get_json()
    assert "token" in data
    assert data["user"]["email"] == "new@example.com"
    assert data["user"]["username"] == "newuser"


def test_register_duplicate_email(client, test_user):
    resp = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "username": "other",
        "password": "pass123",
    })
    assert resp.status_code == 409
    assert "Email" in resp.get_json()["error"]


def test_register_duplicate_username(client, test_user):
    resp = client.post("/api/auth/register", json={
        "email": "other@example.com",
        "username": "testuser",
        "password": "pass123",
    })
    assert resp.status_code == 409
    assert "Username" in resp.get_json()["error"]


def test_register_missing_fields(client):
    resp = client.post("/api/auth/register", json={"email": "x@x.com"})
    assert resp.status_code == 400


def test_login_success(client, test_user):
    resp = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "password123",
    })
    assert resp.status_code == 200
    assert "token" in resp.get_json()


def test_login_wrong_password(client, test_user):
    resp = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "wrongpassword",
    })
    assert resp.status_code == 401


def test_login_unknown_email(client):
    resp = client.post("/api/auth/login", json={
        "email": "nobody@example.com",
        "password": "pass",
    })
    assert resp.status_code == 401


def test_protected_route_without_token(client):
    resp = client.get("/api/recipes/")
    assert resp.status_code == 401
