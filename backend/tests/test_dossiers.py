from tests.test_auth import client, reset_db, engine
import pytest
from sqlalchemy import text


def get_user_token():
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


def get_admin_token():
    # Inscription
    reg = client.post("/auth/register", json={
        "email": "admin_v@mmotors.fr",
        "password": "Admin123!",
        "full_name": "Admin"
    })
    
    # Mise à jour du rôle directement en base
    with engine.connect() as conn:
        conn.execute(text(
            "UPDATE users SET role = 'admin' WHERE email = 'admin_v@mmotors.fr'"
        ))
        conn.commit()
    
    # Login après mise à jour du rôle
    res = client.post("/auth/login", json={
        "email": "admin_v@mmotors.fr",
        "password": "Admin123!"
    })
    
    data = res.json()
    assert "access_token" in data, f"Login failed: {data}"
    return data["access_token"]


def create_test_vehicle(admin_token):
    res = client.post("/vehicles/",
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
    return res.json()["id"]


def test_create_dossier():
    admin_token = get_admin_token()
    user_token = get_user_token()
    vid = create_test_vehicle(admin_token)
    response = client.post("/dossiers/",
        json={
            "vehicle_id": vid,
            "dossier_type": "rental",
            "notes": "Test dossier"
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["dossier_type"] == "rental"
    assert data["status"] == "pending"


def test_list_dossiers_client():
    user_token = get_user_token()
    response = client.get("/dossiers/",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_dossiers_no_token():
    response = client.get("/dossiers/")
    assert response.status_code == 401


def test_update_dossier_status():
    admin_token = get_admin_token()
    user_token = get_user_token()
    vid = create_test_vehicle(admin_token)
    dossier = client.post("/dossiers/",
        json={"vehicle_id": vid, "dossier_type": "purchase"},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    did = dossier.json()["id"]
    response = client.patch(f"/dossiers/{did}/status",
        json={"status": "validated"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "validated"


def test_update_dossier_status_no_admin():
    user_token = get_user_token()
    response = client.patch("/dossiers/1/status",
        json={"status": "validated"},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 403


def test_create_dossier_no_token():
    response = client.post("/dossiers/",
        json={"vehicle_id": 1, "dossier_type": "purchase"}
    )
    assert response.status_code == 401