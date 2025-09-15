import os
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, status
from fastapi.responses import JSONResponse
from typing import List
import json
import shutil
import traceback
from uuid import uuid4
from .analysis import analyze_all_resumes

# Detect Hugging Face environment
RUNNING_IN_HF = "SPACE_ID" in os.environ

if RUNNING_IN_HF:
    BASE_DIR = Path("/tmp")  # Hugging Face can only write to /tmp
else:
    BASE_DIR = Path(__file__).resolve().parent.parent  # Local dev: backend/

UPLOAD_DIR = BASE_DIR / "uploaded_cvs"
JD_DIR = BASE_DIR / "uploaded_jds"
CACHE_DIR = BASE_DIR / "cache"
RESULT_DIR = BASE_DIR / "results"

for d in [UPLOAD_DIR, JD_DIR, CACHE_DIR, RESULT_DIR]:
    d.mkdir(parents=True, exist_ok=True)

RECENT_UPLOADS_FILE = CACHE_DIR / "recent_uploads.json"

router = APIRouter()


@router.post("/upload-resumes/")
async def upload_resumes(files: List[UploadFile] = File(...)):
    print("DEBUG: /resume/upload-resumes called with files:", [file.filename for file in files])
    saved_files = []
    for file in files:
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer_file:
            shutil.copyfileobj(file.file, buffer_file)
        saved_files.append(file.filename)
    RECENT_UPLOADS_FILE.write_text(json.dumps(saved_files, indent=2))
    return {"status": "success", "files_uploaded": saved_files}

def _run_analysis_background(job_id: str, jd_path: str, resume_paths: List[str], weights: dict):
    print(f"--- [Background Job: {job_id}] Starting analysis. ---")
    job_file = RESULT_DIR / f"results_{job_id}.json"
    try:
        results = analyze_all_resumes(jd_path, weights, resume_paths)
        job_file.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"--- [Background Job: {job_id}] Analysis complete. Results saved. ---")
    except Exception as e:
        err = {"error": str(e), "trace": traceback.format_exc()}
        job_file.write_text(json.dumps(err, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"--- [Background Job: {job_id}] Analysis FAILED. Error: {e} ---")

@router.post("/analyze/")
async def analyze_endpoint(
    background_tasks: BackgroundTasks,
    jd_file: UploadFile = File(...),
    education_weight: int = Form(20),
    experience_weight: int = Form(30),
    skills_weight: int = Form(50),
):
    jd_path = JD_DIR / jd_file.filename
    with open(jd_path, "wb") as f:
        shutil.copyfileobj(jd_file.file, f)
    print(f"DEBUG: /resume/analyze called. JD file: {jd_file.filename}, weights: ",
          {"education": education_weight, "experience": experience_weight, "skills": skills_weight})
    if not RECENT_UPLOADS_FILE.exists():
        return JSONResponse(content={"error": "Please upload resumes first."}, status_code=400)

    resume_names = json.loads(RECENT_UPLOADS_FILE.read_text())
    resume_paths = [str(UPLOAD_DIR / name) for name in resume_names]
    print("DEBUG: Resumes to analyze:", resume_paths)
    weights = {"skills": skills_weight, "education": education_weight, "experience": experience_weight}

    job_id = uuid4().hex
    background_tasks.add_task(_run_analysis_background, job_id, str(jd_path), resume_paths, weights)
    
    return JSONResponse(status_code=status.HTTP_202_ACCEPTED, content={"status": "started", "job_id": job_id})

@router.get("/results/{job_id}")
async def get_results(job_id: str):
    print(f"DEBUG: /resume/results called for job_id: {job_id}")
    p = RESULT_DIR / f"results_{job_id}.json"
    if not p.exists():
        return JSONResponse(content={"status": "pending"}, status_code=status.HTTP_202_ACCEPTED)
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        data = {"error": "Could not read results file"}
    return JSONResponse(content=data)