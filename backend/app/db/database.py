from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# ---------------------------------------------------------------------------
# Database path — Vercel serverless functions can only write to /tmp.
# The VERCEL environment variable is automatically set by the Vercel runtime.
# Locally, the db file is placed next to the project for convenience.
# ---------------------------------------------------------------------------
if os.getenv("VERCEL"):
    # /tmp is the only writable directory in Vercel's serverless environment.
    # Note: this is ephemeral and resets on each cold start / redeployment.
    # For persistent storage, migrate to Supabase / Neon / PlanetScale PostgreSQL.
    default_db_url = "sqlite:////tmp/travel_planner.db"
else:
    default_db_url = "sqlite:///./travel_planner.db"

DATABASE_URL = os.getenv("DATABASE_URL", default_db_url)

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    Dependency to yield a database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_faiss():
    """
    Placeholder to initialize the FAISS index for memory retrieval.
    Actual implementation will be in services/agents/memory.py
    """
    pass
