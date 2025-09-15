from sentence_transformers import SentenceTransformer, util
from .extractor import extract_text
import os

# set huggingface cache dir to a place you can write
os.environ["TRANSFORMERS_CACHE"] = "/tmp/transformers_cache"

# load the model once at startup (pick one model string only)
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def compute_similarity(text1, text2):
    if not text1 or not text2:
        return 0.0
    # get embeddings
    emb1 = model.encode(text1, convert_to_tensor=True)
    emb2 = model.encode(text2, convert_to_tensor=True)
    # cosine similarity
    similarity = util.cos_sim(emb1, emb2).item()
    return similarity

def compute_similarity(text1, text2):
    if not text1 or not text2:
        return 0.0
    # Get embeddings
    emb1 = model.encode(text1, convert_to_tensor=True)
    emb2 = model.encode(text2, convert_to_tensor=True)
    # Cosine similarity
    similarity = util.cos_sim(emb1, emb2).item()
    return similarity


def match_all_cvs_to_jd(jd_path, cv_folder):
    results = []
    jd_text = extract_text(jd_path)

    for filename in os.listdir(cv_folder):
        file_path = os.path.join(cv_folder, filename)
        if not os.path.isfile(file_path):
            continue
        try:
            cv_text = extract_text(file_path)
            score = compute_similarity(jd_text, cv_text)
            results.append({
                "filename": filename,
                "match_score": round(score * 100, 2)
            })
        except Exception as e:
            results.append({
                "filename": filename,
                "error": str(e)
            })

    return sorted(results, key=lambda x: x["match_score"], reverse=True)
