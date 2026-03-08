import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.wsgi import WSGIMiddleware
import sys

# --- Adjust Python Path so imports work for the sub-projects ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(BASE_DIR, "logistics_project"))
sys.path.append(os.path.join(BASE_DIR, "agent2_delivery_verification"))
sys.path.append(os.path.join(BASE_DIR, "agent 3", "src"))

# --- Import the applications ---
# 1. Agent 2 (FastAPI) - Delivery Verification
from agent2_delivery_verification.main import app as agent2_app

# 2. Agent 1 (Flask) - OCR
from logistics_project.app import app as agent1_flask_app

# 3. Agent 3 (Flask) - Fraud Detection
from server import app as agent3_flask_app  # Assuming 'server.py' is in 'agent 3/src'


# --- Create Unified Master App ---
app = FastAPI(title="Unified Logistics ML Backend")

# We apply CORS at the master level
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mount the Sub-Applications ---

# Mount Agent 1 (OCR) at /agent1
# All routes inside OCR app will now be accessible via /agent1/api/...
app.mount("/agent1", WSGIMiddleware(agent1_flask_app))

# Mount Agent 3 (Fraud) at /agent3
# All routes inside Fraud app will now be accessible via /agent3/api/...
app.mount("/agent3", WSGIMiddleware(agent3_flask_app))

# Mount Agent 2 (Delivery) at the root / 
# (Since it's already FastAPI, we can just mount it or include its router. 
# For simplicity and avoiding route conflicts, let's mount it at /agent2)
app.mount("/agent2", agent2_app)

@app.get("/")
def health_check():
    return {
        "status": "online", 
        "message": "Unified ML Backend is running",
        "services": {
            "OCR (Agent 1)": "/agent1",
            "Delivery (Agent 2)": "/agent2",
            "Fraud (Agent 3)": "/agent3"
        }
    }

if __name__ == "__main__":
    # Run the unified app on port 8000 (standard for deployment)
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("unified_main:app", host="0.0.0.0", port=port, reload=False)
