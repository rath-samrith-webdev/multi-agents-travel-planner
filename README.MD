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
    python -m app.main
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
