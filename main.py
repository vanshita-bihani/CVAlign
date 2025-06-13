from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from typing import List
from utils.extractor import extract_text

app = FastAPI()

# Allow frontend (React) to talk to backend (FastAPI)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a folder to store uploaded files
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.get("/")
def read_root():
    return {"message": "CVAlign Backend is up!"}


@app.post("/upload-single")
async def upload_single_cv(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"message": f"Uploaded {file.filename} successfully"}


@app.post("/upload-multiple")
async def upload_multiple_cvs(files: List[UploadFile] = File(...)):
    uploaded_files = []
    for file in files:
        file_location = os.path.join(UPLOAD_FOLDER, file.filename)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        uploaded_files.append(file.filename)
    return {"message": f"Uploaded {len(uploaded_files)} files successfully", "files": uploaded_files}

@app.post("/parse/")
async def parse_file(file: UploadFile = File(...)):
    file_ext = os.path.splitext(file.filename)[1].lower()
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    # Save file to disk
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Extract text
    try:
        text = extract_text(file_path)
        return {"filename": file.filename, "text": text}
    except ValueError as e:
        return {"error": str(e)}
