
def test_register_user(client):
    response = client.post(
        "/auth/register",
        json={
            "full_name": "Test User",
            "email": "test@example.com",
            "phone": "9876543210",
            "password": "TestPass123"
        }
    )

    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"


def test_login_user(client):
    client.post(
        "/auth/register",
        json={
            "full_name": "Test User",
            "email": "test@example.com",
            "phone": "9876543210",
            "password": "TestPass123"
        }
    )

    response = client.post(
        "/auth/login",
        data={
            "username": "test@example.com",
            "password": "TestPass123"
        }
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_access_me_without_token(client):
    response = client.get("/auth/me")

    assert response.status_code == 401
