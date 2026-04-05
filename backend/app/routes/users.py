from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.models import User, Trip
from app.db.database import get_db

router = APIRouter()

@router.post("/preferences")
async def update_preferences(user_id: int, preferences: dict, db: Session = Depends(get_db)):
    """
    Update global preferences for a user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Auto-create user for demo purposes if not exists
        user = User(id=user_id, username=f"user_{user_id}", email=f"user{user_id}@example.com")
        db.add(user)

    user.preferences = preferences
    db.commit()
    return {"status": "success", "preferences": preferences}

@router.get("/{user_id}")
async def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """
    Retrieve user information including past trips.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        # Auto-create for demo
        user = User(id=user_id, username=f"DemoUser", email=f"demo@example.com", preferences={"nature": True, "budget": "medium"})
        db.add(user)
        db.commit()
        db.refresh(user)

    trips = db.query(Trip).filter(Trip.user_id == user_id).all()

    return {
        "id": user.id,
        "username": user.username,
        "preferences": user.preferences,
        "trips_count": len(trips),
        "recent_trips": [
            {"id": t.id, "destination": t.destination, "date": t.created_at}
            for t in trips[-5:]
        ]
    }
