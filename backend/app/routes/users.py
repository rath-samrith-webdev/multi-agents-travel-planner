from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.models import User, Trip
from app.db.database import get_db
from app.auth.security import get_current_user_id

router = APIRouter()

@router.post("/preferences")
async def update_preferences(preferences: dict, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    """
    Update global preferences for a user.
    """
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.preferences = preferences
    db.commit()
    return {"status": "success", "preferences": preferences}

@router.get("/me")
async def get_user_profile(db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    """
    Retrieve user information including past trips.
    """
    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    trips = user.trips

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "picture": user.picture,
        "preferences": user.preferences,
        "trips_count": len(trips),
        "recent_trips": [
            {"id": t.id, "destination": t.destination, "date": t.created_at}
            for t in trips[-5:]
        ]
    }
