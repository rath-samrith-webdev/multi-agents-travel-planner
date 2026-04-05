from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

from sqlalchemy import Table

# Association table for group trips (Many-to-Many)
trip_users = Table(
    "trip_users",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("trip_id", Integer, ForeignKey("trips.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    preferences = Column(JSON, default={})

    # All trips the user is part of (as creator or participant)
    trips = relationship("Trip", secondary=trip_users, back_populates="participants")

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id")) # Original creator
    destination = Column(String)
    days = Column(Integer)
    budget = Column(Float)
    itinerary = Column(JSON)
    metadata_info = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    participants = relationship("User", secondary=trip_users, back_populates="trips")
    messages = relationship("ChatMessage", back_populates="trip", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    trip = relationship("Trip", back_populates="messages")
    user = relationship("User")
