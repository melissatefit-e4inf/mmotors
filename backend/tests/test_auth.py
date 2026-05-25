import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db

SQLALCHEMY_TEST_URL = "sqlite:///./test_temp.db"
engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


client = TestClient(app)


def test_register_success():
    response = client.post("/auth/register", json={
        "email": "test@mmotors.fr",
        "password": "Test123!",
        "full_name": "Test User"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@mmotors.fr"
    assert data["role"] == "client"


def test_register_duplicate_email():
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


def test_login_success():
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


def test_login_wrong_password():
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