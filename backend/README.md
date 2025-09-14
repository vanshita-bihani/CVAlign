---
title: CVAlign Backend
emoji: 📄
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# CVAlign Backend

This is the backend for CVAlign, a resume–JD matching and feedback generator.

- **Framework:** FastAPI (served with Uvicorn)
- **Runs on:** Hugging Face Spaces (Docker SDK)
- **Default port:** 7860
- **Entry point:** `main.py` (`app = FastAPI()`)

The backend exposes endpoints for:
- Uploading resumes
- Uploading job descriptions
- Analyzing resumes against JD
- Generating LLM-based feedback (via OpenRouter API)

### Environment Variables
Set in Hugging Face “Variables and secrets”:
- `OPENROUTER_API_KEY` → Your OpenRouter API key (needed for feedback)

### Deployment
This Space builds automatically using the included `Dockerfile` and `requirements.txt`.
