from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Use environment variable for database URL if available, otherwise fallback to local SQLite
# Note: SQLite will not persist across Vercel serverless function calls.
# It is recommended to use a managed database like Vercel Postgres, Supabase, or ElephantSQL for production.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./travel_planner.db")

# If using SQLite, ensure the file is created in a writable directory if needed, 
# although /tmp is the only writable directory in Vercel.
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
