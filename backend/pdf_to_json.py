import fitz  # PyMuPDF

def extract_text_from_pdf(file_path):
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def cv_to_json(text):
    # Dummy structure – improve based on your CV format
    json_data = {
        "name": None,
        "email": None,
        "phone": None,
        "skills": [],
        "education": [],
        "experience": [],
        "raw_text": text
    }

    # Add basic parsing logic here
    if "@" in text:
        lines = text.splitlines()
        for line in lines:
            if "@" in line and not json_data["email"]:
                json_data["email"] = line.strip()
            if "Skills" in line:
                json_data["skills"] = line.replace("Skills", "").split(",")
    return json_data
