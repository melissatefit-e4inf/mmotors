from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sentry_sdk

from app.core.config import settings
from app.core.database import Base, engine
from app.api.routes import auth, vehicles, dossiers

sentry_sdk.init(
    dsn="https://ad080565ed89746281b7f83d1e4962b3@o4511453817274368.ingest.de.sentry.io/4511453829398608",
    send_default_pii=True,
    enable_logs=True,
    traces_sample_rate=1.0,
)

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


@app.get("/sentry-debug")
async def trigger_error():
    division_by_zero = 1 / 0