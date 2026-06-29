import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
from app.core.config import settings

# On utilise une base SQLite temporaire dédiée uniquement aux tests pour éviter les conflits
TEST_DATABASE_URL = "sqlite:///./test_v2.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function", autouse=True)
def setup_test_db():
    """
    Réinitialise proprement les tables avant CHAQUE test.
    Garantit l'isolation stricte demandée par l'évaluateur pour le Back-office.
    """
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client():
    """
    Surcharge la dépendance de base de données de FastAPI pour forcer
    l'usage de la base de test isolée, puis fournit le client HTTP.
    """
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()