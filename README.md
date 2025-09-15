---
title: CVAlign-Backend
sdk: docker
app_port: 7860
---

📄 CVAlign: AI-Powered Resume–JD Alignment Tool
CVAlign is an AI-driven resume screening platform that helps recruiters automatically evaluate resumes against job descriptions (JD). It provides scoring, ranking, and recruiter-style feedback using a combination of NLP, semantic similarity models, and LLMs.

🏗️ Project Overview
The project has been designed as a full-stack system:

🌐 Frontend → React + Chakra UI (deployed on Vercel)

⚡ Backend → FastAPI with Docker (deployed on Hugging Face Spaces)

🧠 AI/NLP Core → Sentence Transformers (semantic similarity), spaCy (NLP), and GPT-based feedback (OpenRouter API)

✨ Features
✅ Upload multiple resumes (PDF/DOCX) and a Job Description

✅ Extract skills, education, and experience automatically

✅ Score candidates using a weighted model (Skills / Education / Experience)

✅ Rank candidates by overall suitability

✅ Generate structured recruiter feedback (strengths, weaknesses, summary) via GPT

✅ Export results to CSV / PDF

✅ End-to-end Dockerized deployment (Hugging Face + Vercel)

🏗️ System Architecture
Code snippet

graph TD
    A[Frontend: Recruiter UI on React + Chakra UI] -->|HTTP Requests| B(Backend API: FastAPI on Hugging Face);
    B --> C{Resume Parsing};
    C --> D{Feature Extraction};
    D --> E{Semantic Similarity};
    E --> F{Weighted Scoring};
    F --> G{LLM Feedback};
    G --> B;
    B -->|JSON Response| A;

    subgraph "Backend Logic"
        C(pdfplumber/docx)
        D(spaCy, regex)
        E(Transformers + Cosine)
        F(Skills/Education/Experience)
        G(OpenRouter GPT API)
    end
🛠️ Tech Stack
Frontend
React (CRA)

Chakra UI

Axios

Vercel deployment

Backend
FastAPI + Uvicorn

Docker (Hugging Face Spaces)

Python 3.10

NLP / AI
sentence-transformers (semantic embeddings)

spaCy (NLP preprocessing)

pdfplumber + python-docx (resume parsing)

OpenRouter API (GPT-based recruiter feedback)

📊 Evaluation
Replaced spaCy’s doc.similarity with Sentence Transformer embeddings + cosine similarity, improving alignment accuracy by ~40% in sample benchmarks.

Example:

JD: Data Science Intern

Candidate A (Web dev) → 0.33

Candidate B (ML/NLP projects) → 0.81

📈 Demonstrates clear separation between suitable and unsuitable candidates.
(See evaluation.ipynb for details.)

🚀 Getting Started (Run Locally)
1️⃣ Clone Repository
Bash

git clone https://github.com/<your-username>/cvalign.git
cd cvalign
2️⃣ Setup Backend (FastAPI)
Bash

cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
Note: Ensure you have Python 3.10+ installed.

3️⃣ Configure API Keys
Create a .env file inside backend/ with:

OPENROUTER_API_KEY=your_openrouter_api_key_here
4️⃣ Run Backend
Bash

uvicorn main:app --reload --port 7860
Backend runs at 👉 http://127.0.0.1:7860

5️⃣ Setup Frontend (React)
Bash

cd ../frontend
npm install
Configure API Base URL in src/config.js:

JavaScript

const API_BASE = "http://127.0.0.1:7860"; // Local backend
export default API_BASE;
6️⃣ Run Frontend
Bash

npm start
Frontend runs at 👉 http://localhost:3000

7️⃣ Usage
Upload one or more resumes (.pdf / .docx)

Upload a Job Description (JD)

Set weights for Skills / Education / Experience

Click Analyze → Wait for processing

View candidate scores, strengths/weaknesses, and feedback

Export results as CSV / PDF

🐳 Run with Docker (Optional)
To containerize the backend:

Bash

cd backend
docker build -t cvalign-backend .
docker run -p 7860:7860 cvalign-backend
🌍 Deployment
Backend → Hugging Face Spaces (Docker SDK)

Frontend → Vercel (React)

Secrets → OPENROUTER_API_KEY configured in Hugging Face
(Settings → Variables & Secrets)

📂 Project Structure
vanshita-bihani-cvalign/
├── backend/            # FastAPI + AI logic
│   ├── resume/         # Resume parsing & analysis
│   ├── utils/          # Extractor & matcher
│   ├── main.py         # FastAPI entry point
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/           # React + Chakra UI
│   ├── src/            # Components & pages
│   └── public/
└── evaluation.ipynb    # Model comparison (spaCy vs Transformers)
📸 Screenshots
📌 Future Improvements
Fine-tune embeddings on Resume–JD pairs for higher accuracy

Add support for multi-language resumes

Integrate with ATS systems (e.g., Greenhouse, Lever)

Provide a recruiter analytics dashboard

👨‍💻 Author
Vanshita Bihani – B.Tech Final Year

LinkedIn: linkedin.com/in/vanshita-bihani-010a5a246

GitHub: github.com/vanshita-bihani

📜 License
MIT License. Free to use and modify.
