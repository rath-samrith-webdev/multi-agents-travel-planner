from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import trips, users
from app.db.database import engine, Base
from app.models import models

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Travel Planner API",
    description="Multi-Agent AI backend for travel planning",
    version="1.0.0"
)

# Enable CORS for the React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routes import trips, users, auth, chat

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(trips.router, prefix="/api/trips", tags=["Trips"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)


@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Travel Planner API"}

