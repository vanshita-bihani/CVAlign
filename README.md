---
title: CVAlign-Backend
sdk: docker
app_port: 7860
---

# 📄 CVAlign: AI-Powered Resume–JD Alignment Tool

CVAlign is an **AI-driven resume screening platform** that helps recruiters automatically evaluate resumes against job descriptions (JD).  
It provides **scoring, ranking, and recruiter-style feedback** using a combination of **NLP, semantic similarity models, and LLMs**.  

The project has been designed as a **full-stack system**:  
- 🌐 **Frontend** → React + Chakra UI (deployed on Vercel)  
- ⚡ **Backend** → FastAPI with Docker (deployed on Hugging Face Spaces)  
- 🧠 **AI/NLP Core** → Sentence Transformers (semantic similarity), spaCy (NLP), and GPT-based feedback (OpenRouter API)  

---

## ✨ Features

- ✅ Upload multiple resumes (PDF/DOCX) and a Job Description  
- ✅ Extract skills, education, and experience automatically  
- ✅ Score candidates using a **weighted model** (Skills / Education / Experience)  
- ✅ Rank candidates by overall suitability  
- ✅ Generate **structured recruiter feedback** (strengths, weaknesses, summary) via GPT  
- ✅ Export results to **CSV / PDF**  
- ✅ End-to-end **Dockerized deployment** (Hugging Face + Vercel)  

---

## 🏗️ System Architecture

Frontend (React + Chakra UI) -----> Backend API (FastAPI on Hugging Face)
↑ ↓
Recruiter UI Resume Parsing (pdfplumber/docx)
|
→ Feature Extraction (spaCy, regex)
→ Semantic Similarity (Transformers + Cosine)
→ Weighted Scoring (Skills/Education/Experience)
→ LLM Feedback (OpenRouter GPT API)

markdown
Copy code

---

## 🛠️ Tech Stack

**Frontend**
- React (CRA)
- Chakra UI
- Axios
- Vercel deployment

**Backend**
- FastAPI + Uvicorn
- Docker (Hugging Face Spaces)
- Python 3.10

**NLP / AI**
- `sentence-transformers` (semantic embeddings)
- `spaCy` (NLP preprocessing)
- `pdfplumber` + `python-docx` (resume parsing)
- `OpenRouter API` (GPT-based recruiter feedback)

---

## 📊 Evaluation

- Replaced spaCy’s `doc.similarity` with **Sentence Transformer embeddings + cosine similarity**,  
  improving **alignment accuracy by ~40%** in sample benchmarks.  
- Example:  
  - JD: *Data Science Intern*  
  - Candidate B (ML/NLP projects) scored **0.81** vs Candidate A (Web dev) scored **0.33**.  
- Demonstrates **clear separation** between suitable and unsuitable candidates.  

*(See [`evaluation.ipynb`](./evaluation.ipynb) for details.)*

---

## 🚀 Getting Started (Run Locally)

### 1️⃣ Clone Repository
```bash
git clone https://github.com/<your-username>/cvalign.git
cd cvalign
2️⃣ Setup Backend (FastAPI)
bash
Copy code
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

pip install --upgrade pip
pip install -r requirements.txt
Ensure you have Python 3.10+ installed.

3️⃣ Configure API Keys
Create a .env file inside backend/ with:

env
Copy code
OPENROUTER_API_KEY=your_openrouter_api_key_here
4️⃣ Run Backend
bash
Copy code
uvicorn main:app --reload --port 7860
Backend runs at: http://127.0.0.1:7860

5️⃣ Setup Frontend (React)
bash
Copy code
cd ../frontend
npm install
Configure API Base URL
Open src/config.js and update:

js
Copy code
const API_BASE = "http://127.0.0.1:7860"; // Local backend
export default API_BASE;
6️⃣ Run Frontend
bash
Copy code
npm start
Frontend runs at: http://localhost:3000

7️⃣ Usage
Upload one or more resumes (.pdf / .docx)

Upload a Job Description (JD)

Set weights for Skills / Education / Experience

Click Analyze → Wait for background job to finish

View candidate scores, strengths/weaknesses, and feedback

Export results as CSV / PDF

🐳 Run with Docker (Optional)
To containerize backend:

bash
Copy code
cd backend
docker build -t cvalign-backend .
docker run -p 7860:7860 cvalign-backend
🌍 Deployment
Backend: Hugging Face Spaces (Docker SDK)

Frontend: Vercel (React)

Secrets: OPENROUTER_API_KEY configured in Hugging Face Environment → Settings > Variables & Secrets

📂 Project Structure
csharp
Copy code
vanshita-bihani-cvalign/
├── backend/              # FastAPI + AI logic
│   ├── resume/           # Resume parsing & analysis
│   ├── utils/            # Extractor & matcher
│   ├── main.py           # FastAPI entry point
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/             # React + Chakra UI
│   ├── src/              # Components & pages
│   └── public/
└── evaluation.ipynb      # Model comparison (spaCy vs Transformers)
📸 Screenshots
(Add screenshots here for recruiter dashboard, upload forms, analysis results.)

📌 Future Improvements
Fine-tune embeddings on Resume–JD pairs for higher accuracy

Add support for multi-language resumes

Integrate with ATS systems (e.g., Greenhouse, Lever)

Provide recruiter analytics dashboard

👨‍💻 Author
Vanshita Bihani – B.Tech Final Year

LinkedIn: 

GitHub: 

📜 License
MIT License. Free to use and modify.