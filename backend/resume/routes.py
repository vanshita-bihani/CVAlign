# In backend/resume/routes.py

from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, status
from fastapi.responses import JSONResponse
from typing import List
import json, sqlite3, hashlib, shutil, traceback
from uuid import uuid4
from pathlib import Path

from .analysis import analyze_all_resumes

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploaded_cvs"
JD_DIR = BASE_DIR / "uploaded_jds"
CACHE_DIR = BASE_DIR / "cache"
RESULT_DIR = BASE_DIR / "results"

for d in [UPLOAD_DIR, JD_DIR, CACHE_DIR, RESULT_DIR]:
    d.mkdir(parents=True, exist_ok=True)

RECENT_UPLOADS_FILE = CACHE_DIR / "recent_uploads.json"
DB_PATH = UPLOAD_DIR / "resumes.db"

router = APIRouter()

def _db_init():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        """CREATE TABLE IF NOT EXISTS resumes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            filehash TEXT UNIQUE
        )"""
    )
    conn.commit()
    return conn


@router.post("/upload-resumes/")
async def upload_resumes(files: List[UploadFile] = File(...)):
    newly_saved_files: List[str] = []
    session_filenames_for_analysis: List[str] = []
    conn = _db_init()
    cur = conn.cursor()

    for uf in files:
        tmp_path = UPLOAD_DIR / f".tmp_{uuid4().hex}"
        hasher = hashlib.sha256()
        await uf.seek(0)
        with open(tmp_path, "wb") as out:
            while True:
                chunk = await uf.read(1024 * 1024)
                if not chunk:
                    break
                hasher.update(chunk)
                out.write(chunk)
        filehash = hasher.hexdigest()

        cur.execute("SELECT filename FROM resumes WHERE filehash=?", (filehash,))
        existing_record = cur.fetchone()

        if existing_record:
            tmp_path.unlink(missing_ok=True)
            existing_filename = existing_record[0]
            session_filenames_for_analysis.append(existing_filename)
        else:
            final_path = UPLOAD_DIR / uf.filename
            if final_path.exists():
                final_path = UPLOAD_DIR / f"{final_path.stem}_{uuid4().hex[:6]}{final_path.suffix}"
            shutil.move(str(tmp_path), str(final_path))
            newly_saved_files.append(final_path.name)
            session_filenames_for_analysis.append(final_path.name)
            cur.execute("INSERT INTO resumes (filename, filehash) VALUES (?,?)", (final_path.name, filehash))

    conn.commit()
    conn.close()

    RECENT_UPLOADS_FILE.write_text(json.dumps(session_filenames_for_analysis, ensure_ascii=False, indent=2), encoding="utf-8")

    # ========= 🐞 DIAGNOSTIC PRINT 1 🐞 =========
    print("\n--- [UPLOAD] ---")
    print(f"Wrote to cache file: {session_filenames_for_analysis}")
    print("----------------\n")
    # ============================================

    return {
        "status": "success", 
        "newly_saved_files": newly_saved_files, 
        "session_files_for_analysis": session_filenames_for_analysis
    }


def _run_analysis_background(job_id: str, jd_path: str, resume_paths: List[str], weights: dict, use_llm: bool):
    try:
        results = analyze_all_resumes(jd_file_path=jd_path, weights=weights, resume_file_paths=resume_paths)
        job_file = RESULT_DIR / f"results_{job_id}.json"
        job_file.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
        (RESULT_DIR / "results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception as e:
        err = {"error": str(e), "trace": traceback.format_exc()}
        job_file = RESULT_DIR / f"results_{job_id}.json"
        job_file.write_text(json.dumps(err, ensure_ascii=False, indent=2), encoding="utf-8")


@router.post("/analyze/")
async def analyze_endpoint(
    background_tasks: BackgroundTasks,
    jd_file: UploadFile = File(...),
    use_llm: str = Form("false"),
    education_weight: int = Form(20),
    experience_weight: int = Form(30),
    skills_weight: int = Form(50),
):
    jd_path = JD_DIR / jd_file.filename
    with open(jd_path, "wb") as f:
        shutil.copyfileobj(jd_file.file, f)

    resume_names: List[str] = []
    if RECENT_UPLOADS_FILE.exists():
        resume_names = json.loads(RECENT_UPLOADS_FILE.read_text(encoding="utf-8"))

    # ========= 🐞 DIAGNOSTIC PRINT 2 🐞 =========
    print("\n--- [ANALYZE] ---")
    print(f"Read from cache file: {resume_names}")
    
    resume_paths = [str(UPLOAD_DIR / name) for name in resume_names if (UPLOAD_DIR / name).is_file()]
    
    print(f"Files that exist and will be analyzed: {resume_paths}")
    print("-----------------\n")
    # ============================================

    if not resume_paths:
        return JSONResponse(content={"error": "No valid resume files found for analysis."}, status_code=status.HTTP_400_BAD_REQUEST)

    weights = {"skills": skills_weight, "education": education_weight, "experience": experience_weight}

    job_id = uuid4().hex
    background_tasks.add_task(_run_analysis_background, job_id, str(jd_path), resume_paths, weights, use_llm.lower() == "true")

    return JSONResponse(status_code=status.HTTP_202_ACCEPTED, content={"status": "started", "job_id": job_id})


@router.get("/results/")
async def get_results(job_id: str = None):
    if job_id:
        p = RESULT_DIR / f"results_{job_id}.json"
    else:
        p = RESULT_DIR / "results.json"

    if not p.exists():
        return JSONResponse(content={"status": "pending"}, status_code=status.HTTP_202_ACCEPTED)

    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        data = {"error": "Could not read results file"}
    return JSONResponse(content=data)