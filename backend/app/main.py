from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import trips, users
from app.db.database import engine, Base
from app.models import models

# Create database tables
# In serverless environment, this should ideally be handled during migration, 
# but for simplicity, we keep it here.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Travel Planner API",
    description="""
    ## Multi-Agent AI backend for travel planning.
    
    This API powers the AI Travel Planner application, utilizing multiple AI agents to:
    * **Plan**: Generate comprehensive itineraries.
    * **Budget**: Optimize costs based on user preferences.
    * **Local Expert**: Suggest hidden gems and local experiences.
    * **Critic**: Ensure feasibility and quality of the plan.
    * **Memory**: Remember user preferences and past trips.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Enable CORS for the React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for Vercel deployment, can be restricted later
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

