def classify_resume_domain(text: str) -> dict:
    text_lower = text.lower()
    domain = "Unknown"
    technical_keywords = ["python", "java", "c++", "javascript", "node.js", "sql", "html", "css", "react", "cloud", "github"]
    marketing_keywords = ["marketing", "digital marketing", "seo", "campaign", "sales", "branding", "analytics"]
    design_keywords = ["figma", "adobe", "illustrator", "ux", "ui", "wireframe", "photoshop"]

    tech_score = sum(1 for kw in technical_keywords if kw in text_lower)
    marketing_score = sum(1 for kw in marketing_keywords if kw in text_lower)
    design_score = sum(1 for kw in design_keywords if kw in text_lower)

    if tech_score > max(marketing_score, design_score) and tech_score > 2:
        domain = "Technical"
    elif marketing_score > max(tech_score, design_score) and marketing_score > 2:
        domain = "Marketing"
    elif design_score > max(tech_score, marketing_score) and design_score > 1:
        domain = "Design"

    return {
        "domain": domain,
        "tech_score": tech_score,
        "marketing_score": marketing_score,
        "design_score": design_score
    }

def classify_jd_domain(jd_text: str) -> str:
    jd_text = jd_text.lower()
    if any(k in jd_text for k in ["developer", "engineer", "software", "full stack", "backend", "frontend", "node.js", "python"]):
        return "Technical"
    elif any(k in jd_text for k in ["marketing", "seo", "sales", "customer", "brand", "campaign"]):
        return "Marketing"
    elif any(k in jd_text for k in ["ux", "ui", "figma", "design", "prototype"]):
        return "Design"
    return "Unknown"
