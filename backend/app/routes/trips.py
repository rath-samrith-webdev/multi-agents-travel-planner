from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.schemas import TripRequest, TripResponse, ParticipantRequest, ChatMessageRequest
from app.models.models import Trip, User, ChatMessage
from app.db.database import get_db
from app.auth.security import get_current_user_id
from app.services.ai_orchestrator import generate_trip
import json
import uuid
from g4f.client import Client

router = APIRouter()

@router.post("/generate", response_model=TripResponse)
async def create_trip(trip_req: TripRequest, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    """
    Generate and save a new travel itinerary.
    """
    try:
        # Generate the plan
        plan_dict = generate_trip(trip_req.model_dump())

        # Save to DB with a fresh invite token
        new_trip = Trip(
            creator_id=current_user_id,
            destination=plan_dict.get("destination"),
            days=plan_dict.get("days"),
            budget=trip_req.budget,
            itinerary=plan_dict.get("itinerary"),
            metadata_info=plan_dict.get("metadata"),
            invite_token=str(uuid.uuid4()),
        )

        # Add creator as the first participant
        creator = db.query(User).filter(User.id == current_user_id).first()
        if creator:
            new_trip.participants.append(creator)

        db.add(new_trip)
        db.commit()
        db.refresh(new_trip)

        plan_dict["id"] = new_trip.id
        plan_dict["invite_token"] = new_trip.invite_token
        plan_dict["creator_id"] = new_trip.creator_id
        return plan_dict
    except Exception as e:
        print(f"Error in create_trip: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{trip_id}")
async def get_trip(trip_id: int, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    """
    Fetch a trip. Only participants may view it.
    """
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    participant_ids = [p.id for p in trip.participants]
    if current_user_id not in participant_ids:
        raise HTTPException(status_code=403, detail="You are not a participant of this trip")

    return {
        "id": trip.id,
        "destination": trip.destination,
        "days": trip.days,
        "budget": trip.budget,
        "itinerary": trip.itinerary,
        "metadata": trip.metadata_info,
        "creator_id": trip.creator_id,
        "invite_token": trip.invite_token,
        "created_at": trip.created_at,
        "participants": [
            {"id": p.id, "username": p.username, "picture": p.picture}
            for p in trip.participants
        ]
    }


@router.get("/{trip_id}/participants")
async def get_participants(trip_id: int, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    """
    List all participants of a trip.
    """
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    participant_ids = [p.id for p in trip.participants]
    if current_user_id not in participant_ids:
        raise HTTPException(status_code=403, detail="You are not a participant of this trip")

    return [
        {"id": p.id, "username": p.username, "picture": p.picture, "email": p.email}
        for p in trip.participants
    ]


@router.get("/{trip_id}/invite-link")
async def get_invite_link(trip_id: int, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    """
    Get or regenerate an invite link for the trip (creator only).
    """
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.creator_id != current_user_id:
        raise HTTPException(status_code=403, detail="Only the trip creator can access the invite link")

    return {"invite_token": trip.invite_token}


@router.post("/join/{invite_token}")
async def join_trip(invite_token: str, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    """
    Allow an authenticated user to join a trip via its invite token.
    """
    trip = db.query(Trip).filter(Trip.invite_token == invite_token).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Invalid or expired invite link")

    user = db.query(User).filter(User.id == current_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    status = "joined"
    if any(p.id == user.id for p in trip.participants):
        status = "already_joined"
    else:
        trip.participants.append(user)
        db.commit()
        db.refresh(trip)

    return {
        "status": status,
        "id": trip.id,
        "destination": trip.destination,
        "days": trip.days,
        "itinerary": trip.itinerary,
        "metadata": trip.metadata_info,
        "creator_id": trip.creator_id,
        "invite_token": trip.invite_token,
    }


@router.post("/chat")
async def modify_plan_chat(trip_id: int, message: str, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    """
    Modify an existing plan via natural language chat.
    Uses g4f to process the request.
    """
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    client = Client()
    prompt = f"""
    You are a travel assistant. A user wants to modify their itinerary.
    Current Itinerary: {json.dumps(trip.itinerary)}
    User Message: "{message}"

    Update the itinerary based on the message.
    Return ONLY the updated itinerary as a JSON array of day objects.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        content = response.choices[0].message.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]

        updated_itinerary = json.loads(content.strip())
        trip.itinerary = updated_itinerary
        db.commit()

        return {"status": "success", "itinerary": updated_itinerary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@router.get("/{trip_id}/messages")
async def get_messages(trip_id: int, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    """
    Get all chat messages for a trip (participants only).
    """
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    participant_ids = [p.id for p in trip.participants]
    if current_user_id not in participant_ids:
        raise HTTPException(status_code=403, detail="You are not a participant of this trip")

    messages = db.query(ChatMessage).filter(ChatMessage.trip_id == trip_id).order_by(ChatMessage.timestamp).all()
    return [
        {
            "id": m.id,
            "user_id": m.user_id,
            "username": m.user.username,
            "picture": m.user.picture if m.user else None,
            "content": m.content,
            "timestamp": m.timestamp
        } for m in messages
    ]


@router.post("/{trip_id}/messages")
async def send_message(trip_id: int, msg_req: ChatMessageRequest, db: Session = Depends(get_db), current_user_id: int = Depends(get_current_user_id)):
    """
    Send a new chat message to a trip (participants only).
    """
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    participant_ids = [p.id for p in trip.participants]
    if current_user_id not in participant_ids:
        raise HTTPException(status_code=403, detail="You are not a participant of this trip")

    new_msg = ChatMessage(
        trip_id=trip_id,
        user_id=current_user_id,
        content=msg_req.content
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)

    return {"status": "success", "id": new_msg.id}

