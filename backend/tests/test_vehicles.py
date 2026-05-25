from tests.test_auth import client


def test_create_vehicle():
    response = client.post("/vehicles/", json={
        "brand": "Renault",
        "model": "Clio",
        "year": 2020,
        "mileage": 45000,
        "price": 12500,
        "fuel_type": "essence",
        "vehicle_type": "sale",
        "description": "Bon état"
    })
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
    create = client.post("/vehicles/", json={
        "brand": "Peugeot",
        "model": "208",
        "year": 2021,
        "mileage": 20000,
        "price": 300,
        "fuel_type": "diesel",
        "vehicle_type": "sale"
    })
    vid = create.json()["id"]
    response = client.patch(f"/vehicles/{vid}/type", json={"vehicle_type": "rental"})
    assert response.status_code == 200
    assert response.json()["vehicle_type"] == "rental"