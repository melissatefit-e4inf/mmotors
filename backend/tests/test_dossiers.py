from app.models.user import User


def get_user_token(client):
    client.post("/auth/register", json={
        "email": "user_d@mmotors.fr",
        "password": "User123!",
        "full_name": "User Test"
    })

    res = client.post("/auth/login", json={
        "email": "user_d@mmotors.fr",
        "password": "User123!"
    })

    return res.json()["access_token"]


def get_admin_token(client, db_session):
    client.post("/auth/register", json={
        "email": "admin_d@mmotors.fr",
        "password": "Admin123!",
        "full_name": "Admin"
    })

    user = db_session.query(User).filter(
        User.email == "admin_d@mmotors.fr"
    ).first()

    user.role = "admin"
    db_session.commit()

    res = client.post("/auth/login", json={
        "email": "admin_d@mmotors.fr",
        "password": "Admin123!"
    })

    data = res.json()
    assert "access_token" in data, f"Login failed: {data}"
    return data["access_token"]


def create_test_vehicle(client, admin_token):
    res = client.post(
        "/vehicles/",
        json={
            "brand": "Toyota",
            "model": "Yaris",
            "year": 2022,
            "mileage": 15000,
            "price": 45,
            "fuel_type": "hybride",
            "vehicle_type": "rental"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert res.status_code == 201, res.json()
    return res.json()["id"]


def test_create_dossier(client, db_session):
    admin_token = get_admin_token(client, db_session)
    user_token = get_user_token(client)
    vehicle_id = create_test_vehicle(client, admin_token)

    response = client.post(
        "/dossiers/",
        json={
            "vehicle_id": vehicle_id,
            "dossier_type": "rental",
            "notes": "Test dossier"
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["dossier_type"] == "rental"
    assert data["status"] == "pending"


def test_list_dossiers_client(client):
    user_token = get_user_token(client)

    response = client.get(
        "/dossiers/",
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_dossiers_no_token(client):
    response = client.get("/dossiers/")
    assert response.status_code == 401


def test_update_dossier_status(client, db_session):
    admin_token = get_admin_token(client, db_session)
    user_token = get_user_token(client)
    vehicle_id = create_test_vehicle(client, admin_token)

    dossier = client.post(
        "/dossiers/",
        json={"vehicle_id": vehicle_id, "dossier_type": "purchase"},
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert dossier.status_code == 201, dossier.json()
    dossier_id = dossier.json()["id"]

    response = client.patch(
        f"/dossiers/{dossier_id}/status",
        json={"status": "validated"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert response.status_code == 200
    assert response.json()["status"] == "validated"


def test_update_dossier_status_no_admin(client):
    user_token = get_user_token(client)

    response = client.patch(
        "/dossiers/1/status",
        json={"status": "validated"},
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 403


def test_create_dossier_no_token(client):
    response = client.post(
        "/dossiers/",
        json={"vehicle_id": 1, "dossier_type": "purchase"}
    )

    assert response.status_code == 401