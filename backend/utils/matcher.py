import spacy
from .extractor import extract_text
import os

nlp = spacy.load("en_core_web_sm")

def compute_similarity(text1, text2):
    doc1 = nlp(text1)
    doc2 = nlp(text2)
    return doc1.similarity(doc2)

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
