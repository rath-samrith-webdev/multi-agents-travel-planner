from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.schemas import TripRequest, TripResponse
from app.models.models import Trip, User
from app.db.database import get_db
from app.services.ai_orchestrator import generate_trip
import json
from g4f.client import Client

router = APIRouter()

@router.post("/generate", response_model=TripResponse)
async def create_trip(trip_req: TripRequest, db: Session = Depends(get_db)):
    """
    Generate and save a new travel itinerary.
    """
    try:
        # Generate the plan
        plan_dict = generate_trip(trip_req.model_dump())

        # Save to DB
        new_trip = Trip(
            creator_id=trip_req.user_id,
            destination=plan_dict.get("destination"),
            days=plan_dict.get("days"),
            budget=trip_req.budget,
            itinerary=plan_dict.get("itinerary"),
            metadata_info=plan_dict.get("metadata")
        )

        # Add creator as the first participant
        creator = db.query(User).filter(User.id == trip_req.user_id).first()
        if creator:
            new_trip.participants.append(creator)

        db.add(new_trip)
        db.commit()
        db.refresh(new_trip)

        # Add the ID to the response
        plan_dict["id"] = new_trip.id
        return plan_dict
    except Exception as e:
        print(f"Error in create_trip: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{trip_id}")
async def get_trip(trip_id: int, db: Session = Depends(get_db)):
    """
    Fetch a previously generated trip from the database.
    """
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.post("/chat")
async def modify_plan_chat(trip_id: int, message: str, db: Session = Depends(get_db)):
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
        # Extract JSON
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

@router.post("/{trip_id}/participants")
async def add_participant(trip_id: int, p_req: ParticipantRequest, db: Session = Depends(get_db)):
    """
    Add a user as a participant to a trip.
    """
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    user = db.query(User).filter(User.id == p_req.user_id).first()

    if not trip or not user:
        raise HTTPException(status_code=404, detail="Trip or User not found")

    if user not in trip.participants:
        trip.participants.append(user)
        db.commit()

    return {"status": "success"}

@router.get("/{trip_id}/messages")
async def get_messages(trip_id: int, db: Session = Depends(get_db)):
    """
    Get all chat messages for a trip.
    """
    messages = db.query(ChatMessage).filter(ChatMessage.trip_id == trip_id).order_by(ChatMessage.timestamp).all()
    return [
        {
            "id": m.id,
            "user_id": m.user_id,
            "username": m.user.username,
            "content": m.content,
            "timestamp": m.timestamp
        } for m in messages
    ]

@router.post("/{trip_id}/messages")
async def send_message(trip_id: int, msg_req: ChatMessageRequest, db: Session = Depends(get_db)):
    """
    Send a new chat message to a trip.
    """
    new_msg = ChatMessage(
        trip_id=trip_id,
        user_id=msg_req.user_id,
        content=msg_req.content
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)

    return {"status": "success", "id": new_msg.id}
