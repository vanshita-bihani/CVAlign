from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # <-- ADD THIS IMPORT
from .resume import routes as resume_routes
import os # <-- ADD THIS IMPORT

app = FastAPI(title="CVAlign API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_routes.router, prefix="/resume", tags=["resume"])

# ✅ ADD THIS BLOCK AT THE END
# This serves the built React app from the root URL
app.mount("/", StaticFiles(directory="frontend/build", html=True), name="static")