"""
Real-time Group Chat via WebSockets.

Architecture:
  - ConnectionManager: maintains a dict of {trip_id -> list[WebSocket]}
  - On connect: verify JWT, load user from DB, send message history, broadcast "user_joined"
  - On message: save to DB, broadcast to all trip participants
  - On disconnect: remove from pool, broadcast "user_left"
"""
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session, joinedload
from typing import Dict, List
from app.db.database import get_db
# pyrefly: ignore [missing-import]
from app.models.models import ChatMessage, User, Trip
from app.auth.security import SECRET_KEY, ALGORITHM
from jose import jwt, JWTError
from datetime import datetime
import json

router = APIRouter()


# ---------------------------------------------------------------------------
# Connection Manager
# ---------------------------------------------------------------------------
class ConnectionManager:
    def __init__(self):
        # Map: trip_id -> list of (websocket, user_info) tuples
        self.active: Dict[int, List[dict]] = {}

    def _room(self, trip_id: int) -> List[dict]:
        return self.active.setdefault(trip_id, [])

    async def connect(self, trip_id: int, websocket: WebSocket, user: dict):
        await websocket.accept()
        self._room(trip_id).append({"ws": websocket, "user": user})

    def disconnect(self, trip_id: int, websocket: WebSocket):
        room = self._room(trip_id)
        self.active[trip_id] = [c for c in room if c["ws"] is not websocket]

    def online_users(self, trip_id: int) -> List[dict]:
        return [c["user"] for c in self._room(trip_id)]

    async def broadcast(self, trip_id: int, payload: dict, exclude: WebSocket = None):
        dead = []
        for conn in self._room(trip_id):
            if conn["ws"] is exclude:
                continue
            try:
                await conn["ws"].send_text(json.dumps(payload))
            except Exception:
                dead.append(conn["ws"])
        # Clean up dead connections
        if dead:
            self.active[trip_id] = [c for c in self._room(trip_id) if c["ws"] not in dead]

    async def send_personal(self, websocket: WebSocket, payload: dict):
        await websocket.send_text(json.dumps(payload))


manager = ConnectionManager()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _verify_jwt(token: str) -> dict:
    """Decode the JWT and return the payload, raising HTTPException on failure."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=403, detail="Invalid token payload")
        return {"user_id": int(user_id)}
    except JWTError:
        raise HTTPException(status_code=403, detail="Could not validate credentials")


def _serialize_message(msg: ChatMessage) -> dict:
    return {
        "type": "message",
        "id": msg.id,
        "trip_id": msg.trip_id,
        "user_id": msg.user_id,
        "username": msg.user.username if msg.user else "Unknown",
        "picture": msg.user.picture if msg.user else None,
        "content": msg.content,
        "timestamp": msg.timestamp.isoformat(),
    }


# ---------------------------------------------------------------------------
# WebSocket Endpoint
# ---------------------------------------------------------------------------
@router.websocket("/ws/{trip_id}")
async def chat_ws(
    trip_id: int,
    websocket: WebSocket,
    token: str = Query(..., description="JWT Bearer token"),
):
    """
    WebSocket endpoint for real-time group chat on a specific trip.
    Token is passed as a query parameter: ws://.../ws/{trip_id}?token=<jwt>
    """
    # 1. Authenticate
    db: Session = next(get_db())
    try:
        token_data = _verify_jwt(token)
    except HTTPException:
        await websocket.close(code=4001)
        return

    user_id = token_data["user_id"]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        await websocket.close(code=4004)
        return

    # 2. Verify the trip exists
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        await websocket.close(code=4004)
        return

    # 3. Verify the user is a participant of this trip
    participant_ids = {p.id for p in trip.participants}
    if user.id not in participant_ids:
        await websocket.close(code=4003)
        return

    user_info = {
        "id": user.id,
        "username": user.username,
        "picture": user.picture,
    }

    # 4. Accept connection
    await manager.connect(trip_id, websocket, user_info)

    try:
        # 5. Send message history (last 50 messages)
        history = (
            db.query(ChatMessage)
            .options(joinedload(ChatMessage.user))
            .filter(ChatMessage.trip_id == trip_id)
            .order_by(ChatMessage.timestamp.asc())
            .limit(50)
            .all()
        )
        await manager.send_personal(websocket, {
            "type": "history",
            "messages": [_serialize_message(m) for m in history],
            "online_users": manager.online_users(trip_id),
        })

        # 6. Broadcast join event to other participants
        await manager.broadcast(trip_id, {
            "type": "user_joined",
            "user": user_info,
            "online_users": manager.online_users(trip_id),
        }, exclude=websocket)

        # 7. Main message loop
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue

            msg_type = data.get("type", "message")

            if msg_type == "typing":
                # Forward typing indicator without saving to DB
                await manager.broadcast(trip_id, {
                    "type": "typing",
                    "user_id": user.id,
                    "username": user.username,
                }, exclude=websocket)

            elif msg_type == "message":
                content = data.get("content", "").strip()
                if not content:
                    continue

                # Persist to database
                new_msg = ChatMessage(
                    trip_id=trip_id,
                    user_id=user.id,
                    content=content,
                    timestamp=datetime.utcnow(),
                )
                db.add(new_msg)
                db.commit()
                db.refresh(new_msg)

                # Broadcast to all participants including sender (for confirmation)
                payload = _serialize_message(new_msg)
                await manager.broadcast(trip_id, payload)

    except WebSocketDisconnect:
        manager.disconnect(trip_id, websocket)
        await manager.broadcast(trip_id, {
            "type": "user_left",
            "user": user_info,
            "online_users": manager.online_users(trip_id),
        })
    finally:
        db.close()
