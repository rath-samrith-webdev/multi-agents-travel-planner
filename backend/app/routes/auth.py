from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.db.database import get_db
from app.models.models import User
from app.auth.security import verify_google_token, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class GoogleAuthRequest(BaseModel):
    token: str

@router.post("/google", summary="Authenticate with Google", description="Verify a Google ID token and return an internal JWT access token.")
async def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    # Step 1: Verify the Google ID token
    idinfo = verify_google_token(request.token)

    google_id = idinfo["sub"]
    email = idinfo.get("email")
    name = idinfo.get("name", "User")
    picture = idinfo.get("picture")

    is_new_user = False

    try:
        # Step 2: Try to find user by google_id (most reliable)
        user = db.query(User).filter(User.google_id == google_id).first()

        if not user:
            # Step 3: Fallback — find by email (user may have registered before OAuth was added)
            user = db.query(User).filter(User.email == email).first()

            if user:
                # Link the existing email account to their Google ID
                logger.info(f"Linking Google ID to existing account for email: {email}")
                user.google_id = google_id
                user.picture = picture
                db.commit()
                db.refresh(user)
            else:
                # Step 4: Brand new user — create their account automatically
                logger.info(f"Creating new user for Google account: {email}")

                # Ensure username uniqueness (Google display name may collide)
                existing_name = db.query(User).filter(User.username == name).first()
                username = name if not existing_name else f"{name}_{google_id[:5]}"

                user = User(
                    google_id=google_id,
                    email=email,
                    username=username,
                    picture=picture,
                    preferences={}
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                is_new_user = True
        else:
            # Step 5: Existing user — keep profile info in sync with Google
            updated = False
            if user.picture != picture:
                user.picture = picture
                updated = True
            if updated:
                db.commit()
                db.refresh(user)

    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error during Google auth for {email}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Database error: {str(e)}. The users table may be missing the 'google_id' column — run a DB migration or reset the database."
        )

    # Step 6: Issue internal JWT with correct expiry (1 week)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "is_new_user": is_new_user,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "picture": user.picture,
            "preferences": user.preferences,
        },
    }
