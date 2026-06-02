from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User
from app.auth.security import verify_google_token, create_access_token
from pydantic import BaseModel

router = APIRouter()

class GoogleAuthRequest(BaseModel):
    token: str

@router.post("/google")
async def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    # Verify token
    idinfo = verify_google_token(request.token)
    
    google_id = idinfo['sub']
    email = idinfo.get('email')
    name = idinfo.get('name', 'User')
    picture = idinfo.get('picture') # Google profile picture URL

    # Find or create user
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        # Fallback to email check if google_id is missing but email matches
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.google_id = google_id
            user.picture = picture
        else:
            # We must ensure the username is unique, though simple for now
            # If name exists, append google_id part
            existing_name = db.query(User).filter(User.username == name).first()
            username = name if not existing_name else f"{name}_{google_id[:5]}"
            user = User(
                google_id=google_id,
                email=email,
                username=username,
                picture=picture
            )
            db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update profile picture if it changed
        if user.picture != picture:
            user.picture = picture
            db.commit()
            db.refresh(user)

    # Generate internal JWT token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "picture": user.picture,
            "preferences": user.preferences
        }
    }
