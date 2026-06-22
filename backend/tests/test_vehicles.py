from tests.test_auth import client, reset_db, engine
import pytest
from sqlalchemy import text


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


def test_create_vehicle():
    token = get_admin_token()
    response = client.post("/vehicles/",
        json={
            "brand": "Renault",
            "model": "Clio",
            "year": 2020,
            "mileage": 45000,
            "price": 12500,
            "fuel_type": "essence",
            "vehicle_type": "sale",
            "description": "Bon état"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["brand"] == "Renault"
    assert data["vehicle_type"] == "sale"


def test_list_vehicles():
    response = client.get("/vehicles/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_vehicle_not_found():
    response = client.get("/vehicles/9999")
    assert response.status_code == 404


def test_update_vehicle_type():
    token = get_admin_token()
    create = client.post("/vehicles/",
        json={
            "brand": "Peugeot",
            "model": "208",
            "year": 2021,
            "mileage": 20000,
            "price": 300,
            "fuel_type": "diesel",
            "vehicle_type": "sale"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert create.status_code == 201
    vid = create.json()["id"]
    response = client.patch(f"/vehicles/{vid}/type",
        json={"vehicle_type": "rental"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["vehicle_type"] == "rental"


def test_create_vehicle_no_token():
    response = client.post("/vehicles/",
        json={
            "brand": "BMW",
            "model": "Serie 1",
            "year": 2020,
            "mileage": 35000,
            "price": 75,
            "fuel_type": "essence",
            "vehicle_type": "rental"
        }
    )
    assert response.status_code == 401


def test_delete_vehicle():
    token = get_admin_token()
    create = client.post("/vehicles/",
        json={
            "brand": "Citroën",
            "model": "C3",
            "year": 2023,
            "mileage": 8000,
            "price": 14500,
            "fuel_type": "essence",
            "vehicle_type": "sale"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    vid = create.json()["id"]
    response = client.delete(f"/vehicles/{vid}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 204