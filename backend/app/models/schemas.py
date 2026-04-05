from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from datetime import datetime

class TripRequest(BaseModel):
    user_id: int
    destination: str
    days: int
    budget: float
    preferences: List[str] = []

class Activity(BaseModel):
    name: str
    time: str
    cost: Optional[float]
    notes: Optional[str]

class DayItinerary(BaseModel):
    day: int
    activities: List[Activity]

class TripResponse(BaseModel):
    destination: str
    days: int
    itinerary: List[DayItinerary]
    metadata: Dict[str, Any]

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class ChatMessageResponse(BaseModel):
    id: int
    user_id: int
    username: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

class ParticipantRequest(BaseModel):
    user_id: int

class ChatMessageRequest(BaseModel):
    user_id: int
    content: str
