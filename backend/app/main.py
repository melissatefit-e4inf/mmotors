from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sentry_sdk
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.database import Base, engine
from app.api.routes import auth, vehicles, dossiers

sentry_sdk.init(
    dsn="https://ad080565ed89746281b7f83d1e4962b3@o4511453817274368.ingest.de.sentry.io/4511453829398608",
    send_default_pii=True,
    enable_logs=True,
    traces_sample_rate=1.0,
)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.APP_NAME,
    description="API REST pour la gestion de véhicules M-Motors",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mmotors-frontend.onrender.com",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
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