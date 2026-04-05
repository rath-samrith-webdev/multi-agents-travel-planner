from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models.models import User, Trip

def seed_data():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if mock users already exist
        if db.query(User).filter(User.username == "alice_explorer").first():
            print("Mock data already exists.")
            return

        # Create Mock Users
        users = [
            User(username="alice_explorer", email="alice@example.com", preferences={"adventure": 0.8, "nature": 0.9}),
            User(username="bob_backpacker", email="bob@example.com", preferences={"budget": 0.9, "history": 0.7}),
            User(username="charlie_luxury", email="charlie@example.com", preferences={"luxury": 1.0, "food": 0.8}),
            User(username="travel_bot", email="bot@trips.ai", preferences={"all": 0.5})
        ]

        db.add_all(users)
        db.commit()
        print(f"Added {len(users)} mock users.")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
