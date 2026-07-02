# AI Multi-Agent Travel Planner

A full-stack application for planning travels using a multi-agent AI system orchestration.

## Features

- Multi-agent AI orchestration for travel planning.
- FastAPI backend for high performance.
- React/Vite frontend with Tailwind CSS and shadcn/ui.
- PostgreSQL database with pgvector for efficient AI memory.

## Getting Started

### Prerequisites

- **Python 3.8+**
- **Node.js 18+**
- **Docker & Docker Compose**
- **Google Gemini API Key**

---

### 1. Database Setup (Docker)

The project uses PostgreSQL with the `pgvector` extension.

```bash
docker-compose up -d
```

---

### 2. Backend Setup (FastAPI)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate

    # Linux / macOS
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure environment variables:**
    Ensure you have a `.env` file in the `backend/` directory with your Gemini API key:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

5.  **Run the FastAPI server:**
    ```bash
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
    ```
    The backend should now be running at `http://127.0.0.1:8000`.

---

### 3. Frontend Setup (React/Vite)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The frontend should now be running at `http://localhost:5173`.

---

## Project Structure

- `backend/`: FastAPI source code and API logic.
- `frontend/`: React application with Vite and Tailwind CSS.
- `docker-compose.yml`: Database configuration.

---

## Deployment

The frontend and backend deploy to different platforms because the backend's
group chat relies on persistent WebSocket connections, which Vercel's
serverless Python runtime does not support.

### Frontend (Vercel)

- Deploy the `frontend/` directory as a Vercel project (`frontend/vercel.json`
  is already configured for a static Vite build).
- In the Vercel project's Environment Variables, set:
  - `VITE_GOOGLE_CLIENT_ID`
  - `VITE_API_BASE_URL` — `https://<your-backend-host>/api`
  - `VITE_WS_BASE_URL` — `wss://<your-backend-host>/api/chat/ws`

### Backend (Render)

- Deploy the `backend/` directory to Render using `backend/render.yaml`
  (a Render Blueprint). It provisions a web service with a small persistent
  disk mounted at `/var/data` so the SQLite database survives restarts and
  redeploys.
- Set these secrets in the Render dashboard (marked `sync: false` in
  `render.yaml` so they aren't stored in git): `JWT_SECRET_KEY`,
  `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- `CORS_ORIGINS` defaults to the production Vercel frontend URL — update it
  (comma-separated) if the frontend is deployed elsewhere.
- The Render plan must support persistent disks (the free tier's disk is
  ephemeral); `render.yaml` requests the `starter` plan.
