from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Use SQLite for local development as requested
DATABASE_URL = "sqlite:///./travel_planner.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
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
