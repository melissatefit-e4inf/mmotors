from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.api.routes import auth, vehicles, dossiers

app = FastAPI(
    title=settings.APP_NAME,
    description="API REST pour la gestion de véhicules M-Motors",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(dossiers.router)


@app.get("/")
def root():
    return {"message": "M-Motors API", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "healthy"}