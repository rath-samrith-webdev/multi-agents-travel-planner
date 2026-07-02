from dotenv import load_dotenv
load_dotenv()

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.models import models  # noqa: F401 — ensure all models are registered

# ---------------------------------------------------------------------------
# CORS origins — read from env so Vercel env vars can override without code changes.
# allow_origins=["*"] CANNOT be combined with allow_credentials=True (browser spec).
# ---------------------------------------------------------------------------
_raw_origins = os.getenv(
    "CORS_ORIGINS",
    "https://multi-agents-travel-planner.vercel.app,http://localhost:5173,http://127.0.0.1:5173"
)
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs on every cold start — creates tables if they don't exist yet.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="AI Travel Planner API",
    description="""
    ## Multi-Agent AI backend for travel planning.

    This API powers the AI Travel Planner application, utilizing multiple AI agents to:
    * **Plan**: Generate comprehensive itineraries.
    * **Budget**: Optimize costs based on user preferences.
    * **Local Expert**: Suggest hidden gems and local experiences.
    * **Critic**: Ensure feasibility and quality of the plan.
    * **Memory**: Remember user preferences and past trips.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routes import trips, users, auth, chat  # noqa: E402

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(trips.router, prefix="/api/trips", tags=["Trips"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])


@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Travel Planner API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
