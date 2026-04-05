import os
from app.db.database import engine, Base
from app.db.database import SessionLocal
from app.models.models import User, Trip, ChatMessage, trip_users

def reset_db():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Database reset successfully.")

if __name__ == "__main__":
    reset_db()
    # Then import and run seed
    from seed_data import seed_data
    seed_data()
