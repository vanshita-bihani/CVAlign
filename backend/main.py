from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from resume import routes as resume_routes
import os # <-- ADD THIS IMPORT
from pathlib import Path
from dotenv import load_dotenv

# Always load backend/.env regardless of working dir
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)



app = FastAPI(title="CVAlign API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_routes.router, prefix="/resume", tags=["resume"])

app.include_router(resume_routes.router, prefix="/resume")