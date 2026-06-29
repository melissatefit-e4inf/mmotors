def test_register_success(client):
    response = client.post("/auth/register", json={
        "email": "test@mmotors.fr",
        "password": "Test123!",
        "full_name": "Test User"
    })

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@mmotors.fr"
    assert data["role"] == "client"


def test_register_duplicate_email(client):
    client.post("/auth/register", json={
        "email": "duplicate@mmotors.fr",
        "password": "Test123!",
        "full_name": "User"
    })

    response = client.post("/auth/register", json={
        "email": "duplicate@mmotors.fr",
        "password": "Test123!",
        "full_name": "User"
    })

    assert response.status_code == 400


def test_login_success(client):
    client.post("/auth/register", json={
        "email": "login@mmotors.fr",
        "password": "Test123!",
        "full_name": "Login User"
    })

    response = client.post("/auth/login", json={
        "email": "login@mmotors.fr",
        "password": "Test123!"
    })

    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password(client):
    client.post("/auth/register", json={
        "email": "login2@mmotors.fr",
        "password": "Test123!",
        "full_name": "Login User"
    })

    response = client.post("/auth/login", json={
        "email": "login2@mmotors.fr",
        "password": "WrongPass!"
    })

    assert response.status_code == 401