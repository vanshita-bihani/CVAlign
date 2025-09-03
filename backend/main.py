from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.resume import routes as resume_routes

app = FastAPI(title="CVAlign API")

# CORS (important for React to call FastAPI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict later to http://localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include resume routes
app.include_router(resume_routes.router, prefix="/resume", tags=["resume"])

@app.get("/")
async def root():
    return {"message": "Backend is running!"}
