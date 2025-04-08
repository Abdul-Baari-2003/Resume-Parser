import re
import spacy

nlp = spacy.load("en_core_web_sm")

# A basic skill list
SKILLS_DB = [
    "python", "java", "c++", "sql", "html", "css", "javascript",
    "node.js", "react", "django", "flask", "git", "docker"
]

def extract_ai_fields(text):
    doc = nlp(text)
    name = ""
    email = ""
    phone = ""
    skills = set()

    # Find name from proper nouns
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            name = ent.text
            break

    # Email & phone using regex
    email_match = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    phone_match = re.findall(r'\+?\d{1,3}[\s\-()]?\d{3}[\s\-()]?\d{3}[\s\-()]?\d{4}', text)

    # Match skills by keyword
    lower_text = text.lower()
    for skill in SKILLS_DB:
        if skill.lower() in lower_text:
            skills.add(skill.lower())

    return {
        "name": name.title() if name else "",
        "email": email_match[0] if email_match else "",
        "phone": phone_match[0] if phone_match else "",
        "skills": ", ".join(sorted(skills)) if skills else ""
    }
