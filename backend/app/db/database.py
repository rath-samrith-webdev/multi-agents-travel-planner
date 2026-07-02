from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# ---------------------------------------------------------------------------
# Database path — defaults to a local file for dev. In production (a
# persistent host, not serverless), set DATABASE_URL to a path on a mounted
# disk (e.g. sqlite:////var/data/travel_planner.db on Render) so data survives
# restarts/redeploys.
# ---------------------------------------------------------------------------
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
