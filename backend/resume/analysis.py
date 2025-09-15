import json
import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI
from utils.extractor import extract_text
from utils.matcher import compute_similarity

from dotenv import load_dotenv
load_dotenv()

# Detect Hugging Face environment to use the correct writable directory
RUNNING_IN_HF = "SPACE_ID" in os.environ

if RUNNING_IN_HF:
    BASE_DIR = Path("/tmp")  # Hugging Face can only write to /tmp
else:
    BASE_DIR = Path(__file__).resolve().parent.parent # Local dev: backend/

# Define paths based on the dynamic BASE_DIR
RESUMES_DIR = BASE_DIR / "uploaded_cvs"
JDS_DIR = BASE_DIR / "uploaded_jds"
RESULTS_FILE = BASE_DIR / "results" / "results.json" # This will now be /tmp/results/results.json on HF
RECENT_UPLOADS_FILE = BASE_DIR / "cache" / "recent_uploads.json"
COMMON_SKILLS = {
    "python", "java", "javascript", "typescript", "react", "node", "django", "flask",
    "fastapi", "sql", "postgres", "mongodb", "aws", "azure", "docker", "kubernetes",
    "nlp", "pytorch", "tensorflow", "scikit-learn", "sklearn", "pandas", "numpy",
    "git", "rest", "graphql"
}

def extract_skills_from_text(text: str) -> List[str]:
    if not text:
        return []
    txt = text.lower()
    found = [kw for kw in COMMON_SKILLS if kw in txt]
    return sorted(found)

def _clean_line(line: str) -> str:
    line = re.sub(r"\S+@\S+", "", line)
    line = re.sub(r"\s{2,}", " ", line).strip(" |:-\t")
    return line.strip()

def extract_education_from_text(text: str) -> str:
    if not text:
        return "Unknown"
    lines = [_clean_line(l) for l in text.splitlines() if l.strip()]
    DEGREE_RE = r"(B\.?Tech|M\.?Tech|B\.?E|B\.?Sc|M\.?Sc|Bachelor|Master|Ph\.?D|MBA)"
    INST_RE = r"(Indian Institute of Technology|IIT\s?-?\s?[A-Za-z]+|NIT\s?-?\s?[A-Za-z]+|National Institute of Technology|University|College|Institute of Technology)"
    CGPA_RE = r"(?:CGPA|CPI)\s*:?\s*([0-9]\.\d{1,2})"
    YEAR_RE = r"(\d{4}\s*-\s*\d{4}|\d{4}\s*-\s*Present)"
    best_entry = {"score": 0, "text": ""}
    for line in lines:
        if not (re.search(DEGREE_RE, line, re.I) and re.search(INST_RE, line, re.I)):
            continue
        score, parts = 0, []
        degree_match, inst_match, year_match, cgpa_match = re.search(DEGREE_RE, line, re.I), re.search(INST_RE, line, re.I), re.search(YEAR_RE, line, re.I), re.search(CGPA_RE, line, re.I)
        if degree_match: score, parts = score + 2, parts + [degree_match.group(0).strip()]
        if inst_match: score, parts = score + 2, parts + [inst_match.group(0).strip()]
        if year_match: score, parts = score + 1, parts + [year_match.group(0).strip()]
        if cgpa_match: score, parts = score + 1, parts + [cgpa_match.group(0).strip()]
        if score > best_entry["score"]:
            best_entry["score"], best_entry["text"] = score, " | ".join(parts)
    return best_entry["text"] or "Unknown"

def extract_experience_years_from_text(text: str) -> int:
    if not text: return 0
    m = re.search(r"(\d{1,2})\s*\+?\s*(years|yrs|y)", text, flags=re.IGNORECASE)
    if m:
        try: return int(m.group(1))
        except Exception: return 0
    m2 = re.search(r"experience[:\-]?\s*(\d{1,2})", text, flags=re.IGNORECASE)
    if m2:
        try: return int(m2.group(1))
        except Exception: return 0
    return 0

def jd_edu_match(jd_text: str, resume_edu: str) -> bool:
    jd_lower, edu_lower = (jd_text or "").lower(), (resume_edu or "").lower()
    keywords = ["bachelor", "master", "phd", "degree", "mba"]
    return any((k in jd_lower) and (k in edu_lower) for k in keywords)

def score_education(resume_edu: str) -> float:
    edu_lower = resume_edu.lower()
    cgpa_score, branch_score, courses_score = 0.0, 0.5, 0.0
    cgpa_match = re.search(r"(\d\.\d{1,2})", edu_lower)
    if cgpa_match:
        try:
            cgpa_val = float(cgpa_match.group(1))
            cgpa_score = min(cgpa_val / 10, 1.0)
        except: pass
    if "computer" in edu_lower or "cse" in edu_lower or "it" in edu_lower: branch_score = 1.0
    elif "electronics" in edu_lower or "ece" in edu_lower: branch_score = 0.7
    else: branch_score = 0.4
    relevant_courses = {"dsa", "os", "dbms", "ml", "ai", "nlp", "cn", "algo"}
    course_matches = sum(1 for c in relevant_courses if c in edu_lower)
    courses_score = course_matches / max(len(relevant_courses), 1)
    return (0.5 * cgpa_score + 0.3 * branch_score + 0.2 * courses_score) * 100

def score_skills(candidate_skills: List[str], required_skills: List[str]) -> float:
    candidate_skills = set(s.lower() for s in candidate_skills)
    required_skills = set(s.lower() for s in required_skills)
    matched = len(candidate_skills & required_skills)
    matched_score = matched / max(len(required_skills), 1)
    extra_factor = (len(candidate_skills) - matched) / max(len(required_skills), 1)
    tie_break_bonus = min(len(candidate_skills) * 0.005, 0.05)
    return min((matched_score + 0.2 * extra_factor + tie_break_bonus) * 100, 100)

def _load_recent_uploads() -> List[str]:
    if RECENT_UPLOADS_FILE.exists():
        try:
            return json.loads(RECENT_UPLOADS_FILE.read_text(encoding="utf-8"))
        except Exception: return []
    return []

# In backend/resume/analysis.py

def analyze_all_resumes(
    jd_file_path: str,
    weights: Dict[str, float],
    resume_file_paths: Optional[List[str]] = None
) -> List[Dict[str, Any]]:

    # ✅ --- IMPROVEMENT 1: ENHANCED LOGGING & CLIENT INITIALIZATION ---
    client = None
    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        print("[CRITICAL] OPENROUTER_API_KEY not found in environment variables.")
    else:
        # Mask the key for security in logs
        print(f"[DEBUG] Found API key: sk-...{api_key[-4:]}")
        try:
            client = OpenAI(
                api_key=api_key,
                base_url="https://openrouter.ai/api/v1",
                timeout=30.0, # Add a timeout to prevent hanging
            )
            print("[DEBUG] OpenAI client initialized successfully.")
        except Exception as e:
            print(f"[CRITICAL] Failed to create OpenAI client. EXCEPTION: {e}")
            client = None
    # --- END IMPROVEMENT 1 ---

    if isinstance(weights, str):
        try:
            weights = json.loads(weights.replace("'", "\""))
        except Exception:
            weights = {}
    if not isinstance(weights, dict):
        weights = {}

    try:
        jd_text = extract_text(jd_file_path)
    except Exception as e:
        jd_text, jd_extract_error = "", str(e)
    else:
        jd_extract_error = ""

    jd_skills = extract_skills_from_text(jd_text)
    results: List[Dict[str, Any]] = []

    if resume_file_paths is None:
        resume_file_paths = _load_recent_uploads()
        resume_file_paths = [str(RESUMES_DIR / p) for p in resume_file_paths]

    resume_paths = [Path(p) for p in resume_file_paths if Path(p).is_file()]

    if not resume_paths:
        RESULTS_FILE.parent.mkdir(parents=True, exist_ok=True)
        RESULTS_FILE.write_text("[]", encoding="utf-8")
        return []

    for resume_path in resume_paths:
        try:
            resume_text = extract_text(str(resume_path))
        except Exception as e:
            results.append({
                "name": resume_path.stem,
                "original_filename": resume_path.name,
                "error": f"Could not extract text: {e}"
            })
            continue

        try:
            semantic_score = compute_similarity(jd_text or "", resume_text or "") * 100
        except Exception:
            semantic_score = 0.0

        resume_skills = extract_skills_from_text(resume_text)
        skill_score = score_skills(resume_skills, jd_skills)
        resume_edu = extract_education_from_text(resume_text)
        education_score = score_education(resume_edu)
        resume_exp_years = extract_experience_years_from_text(resume_text)
        experience_score = min((resume_exp_years / 10) * 100, 100)

        w_s = weights.get("skills", 50)
        w_e = weights.get("education", 20)
        w_x = weights.get("experience", 30)
        total_weight = w_s + w_e + w_x
        if total_weight == 0:
            final_score = 0.0
        else:
            final_score = (w_s * skill_score + w_e * education_score + w_x * experience_score) / total_weight

        feedback_data = {"strengths": [], "weaknesses": [], "feedback": ""}
        if client:
            try:
                # ✅ --- IMPROVEMENT 2: MORE ROBUST PROMPT ---
                feedback_prompt = f"""
You are an expert HR analyst. Your task is to compare a candidate's resume against a job description.
Provide your analysis in a structured JSON format.

The job description is:
---
{jd_text}
---

The candidate's resume is:
---
{resume_text}
---

Based on the comparison, please provide 3 strengths and 3 weaknesses. Also, write a brief overall feedback summary.
ONLY respond with a valid JSON object in the following format, with no other text before or after it:
{{
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
  "feedback": "A short summary of the candidate's suitability."
}}
"""
                # --- END IMPROVEMENT 2 ---

                # ✅ --- IMPROVEMENT 3: MORE RESILIENT API CALL & PARSING ---
                llm_resp = client.chat.completions.create(
                    model="openai/gpt-4o-mini",
                    messages=[{"role": "user", "content": feedback_prompt}],
                    # REMOVED: response_format={"type": "json_object"}
                    # This parameter is not universally supported and can cause silent failures.
                    # It's more reliable to ask for JSON in the prompt and parse it.
                )
                
                raw_content = llm_resp.choices[0].message.content
                print(f"[DEBUG] Raw LLM response for {resume_path.name}: {raw_content}")

                # Safely parse the JSON response from the string
                feedback_data = json.loads(raw_content or "{}")

            except Exception as e:
                print(f"[ERROR] LLM feedback generation failed for {resume_path.name}: {e}")
                feedback_data["feedback"] = f"Feedback generation failed: {e}"
            # --- END IMPROVEMENT 3 ---
        else:
            feedback_data["feedback"] = "Feedback not available (API key missing or client failed to initialize)."

        results.append({
            "name": resume_path.stem,
            "original_filename": resume_path.name,
            "semantic_score": round(float(semantic_score), 2),
            "skills_matched": list(set(resume_skills) & set(jd_skills)),
            "skill_score": round(float(skill_score), 2),
            "education": resume_edu,
            "education_score": round(float(education_score), 2),
            "experience": f"{resume_exp_years} years",
            "experience_score": round(float(experience_score), 2),
            "score": round(float(final_score), 2),
            **feedback_data,
            "raw_feedback": feedback_data.get("feedback", "")
        })

    results.sort(key=lambda x: x.get("score", 0), reverse=True)
    RESULTS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(RESULTS_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    return results