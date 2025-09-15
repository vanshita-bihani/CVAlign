---
title: CVAlign-Backend
sdk: docker
app_port: 7860
---

# 📄 CVAlign: AI-Powered Resume–JD Alignment Tool

CVAlign is an AI-driven resume screening platform that helps recruiters automatically evaluate resumes against job descriptions (JD). It provides scoring, ranking, and recruiter-style feedback using a combination of NLP, semantic similarity models, and LLMs.

---

## 🏗️ Project Overview

The project is a complete full-stack system:

* 🌐 **Frontend:** React + Chakra UI (Deployed on Vercel)
* ⚡ **Backend:** FastAPI with Docker (Deployed on Hugging Face Spaces)
* 🧠 **AI/NLP Core:** Sentence Transformers, spaCy, and a GPT-based model via the OpenRouter API.

---

## ✨ Features

* ✅ **File Uploads:** Accepts multiple resumes (PDF/DOCX) and one Job Description.
* ✅ **Automated Extraction:** Pulls skills, education, and experience from documents.
* ✅ **Weighted Scoring:** Scores candidates based on customizable weights for skills, education, and experience.
* ✅ **Candidate Ranking:** Ranks all candidates by their final suitability score.
* ✅ **AI-Generated Feedback:** Creates structured, recruiter-style feedback (strengths, weaknesses, summary) via an LLM.
* ✅ **Export Results:** Allows exporting the analysis to CSV or printing as a PDF.

---

## 🛠️ Tech Stack

| Category      | Technologies                                                                   |
| ------------- | ------------------------------------------------------------------------------ |
| **Frontend** | `React`, `Chakra UI`, `Axios`                                                  |
| **Backend** | `Python 3.10`, `FastAPI`, `Uvicorn`                                            |
| **AI / NLP** | `sentence-transformers`, `spaCy`, `pdfplumber`, `python-docx`, `OpenRouter API`  |
| **DevOps** | `Docker`, `Git`, `Hugging Face Spaces`, `Vercel`                               |

---

## 🚀 Getting Started (Run Locally)

#### 1. Clone Repository
```bash
git clone [https://github.com/vanshita-bihani/cvalign.git](https://github.com/vanshita-bihani/cvalign.git)
cd cvalign
2. Setup & Run Backend
Bash

# Navigate to backend directory
cd backend

# Create a .env file and add your API key
echo "OPENROUTER_API_KEY=your_key_here" > .env

# Run with Docker (Recommended)
docker build -t cvalign-backend .
docker run -p 7860:7860 --env-file .env cvalign-backend
The backend will be running at http://127.0.0.1:7860

3. Setup & Run Frontend
Bash

# Navigate to frontend directory from the root
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
The frontend will open at http://localhost:3000

📸 Screenshot
👨‍💻 Author
Vanshita Bihani

LinkedIn: linkedin.com/in/vanshita-bihani

GitHub: github.com/vanshita-bihani

📜 License
This project is licensed under the MIT License.
