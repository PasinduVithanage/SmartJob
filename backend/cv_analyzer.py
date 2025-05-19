import requests
import re
import io
import PyPDF2

def extract_text_from_pdf(pdf_url):
    """Extracts text from a PDF file given its URL."""
    try:
        response = requests.get(pdf_url)
        pdf_file = io.BytesIO(response.content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ' '.join([page.extract_text() or "" for page in pdf_reader.pages])
        return text.strip()
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""

def analyze_cv_with_model(cv_text, cv_analyzer):
    """Analyze CV text using the provided model."""
    # Prepare prompt for CV analysis
    prompt = f"""Analyze this CV and provide a structured response in the following format:

CV Content: {cv_text[:1500]}

Skills:
- List each technical skill
- List each soft skill

Experience:
- List years of experience
- List each role and position

Improvements:
- List specific improvements needed

Categories:
- List suitable job categories

Score: [0-100]

Please format the response with clear section headers and bullet points."""

    # Generate CV analysis using the pipeline
    analysis = cv_analyzer(
        prompt,
        max_length=1500,
        num_return_sequences=1,
        temperature=0.6,
        top_p=0.9,
    )[0]['generated_text']
    
    return analysis

def parse_llm_output(analysis_text):
    try:
        # Split into sections more reliably
        sections = analysis_text.split('\n\n')
        results = {
            'skills': [],
            'experience': [],
            'improvements': [],
            'categories': [],
            'score': 70
        }
        
        current_section = None
        for section in sections:
            section = section.lower().strip()
            
            # More robust section detection
            if 'skills:' in section:
                skills = [s.strip('- ').strip() for s in section.split('\n')[1:]]
                results['skills'].extend([s for s in skills if s and not s.startswith('skills')])
            elif 'experience:' in section:
                exp = [e.strip('- ').strip() for e in section.split('\n')[1:]]
                results['experience'].extend([e for e in exp if e and not e.startswith('experience')])
            elif 'improve' in section:
                imp = [i.strip('- ').strip() for i in section.split('\n')[1:]]
                results['improvements'].extend([i for i in imp if i and not i.startswith('improve')])
            elif 'categor' in section:
                cat = [c.strip('- ').strip() for c in section.split('\n')[1:]]
                results['categories'].extend([c for c in cat if c and not c.startswith('categor')])
            elif 'score:' in section or 'strength:' in section:
                score = ''.join(filter(str.isdigit, section))
                if score:
                    results['score'] = min(max(int(score[:2]), 0), 100)

        # Clean up and ensure no empty lists
        for key in results:
            if isinstance(results[key], list):
                results[key] = [item for item in results[key] if item]
                if not results[key]:
                    if key == 'skills':
                        results[key] = extract_skills_from_text(analysis_text)
                    elif key == 'experience':
                        results[key] = extract_experience_from_text(analysis_text)
                    elif key == 'improvements':
                        results[key] = generate_improvements(analysis_text)
                    elif key == 'categories':
                        results[key] = extract_categories_from_text(analysis_text)
                        
        return results
        
    except Exception as e:
        print(f"Parse error: {str(e)}")
        return {
            'skills': extract_skills_from_text(analysis_text),
            'experience': extract_experience_from_text(analysis_text),
            'improvements': generate_improvements(analysis_text),
            'categories': extract_categories_from_text(analysis_text),
            'score': calculate_cv_score(analysis_text, [], [])
        }

def extract_skills_from_text(text):
    common_skills = ['python', 'javascript', 'react', 'node.js', 'typescript', 
                     'java', 'c++', 'sql', 'aws', 'docker', 'kubernetes']
    found_skills = []
    for skill in common_skills:
        if skill.lower() in text.lower():
            found_skills.append(skill)
    return found_skills if found_skills else ['No specific skills detected']

def extract_experience_from_text(text):
    experience = []
    
    # Look for years of experience
    year_pattern = r'(\d+)[\s-]*(year|yr)s?\s*(of)?\s*experience'
    matches = re.finditer(year_pattern, text.lower())
    for match in matches:
        experience.append(f"{match.group(1)} years experience")
    
    # Look for job titles
    job_titles = ['developer', 'engineer', 'manager', 'analyst', 'designer']
    for title in job_titles:
        if title.lower() in text.lower():
            experience.append(f"Worked as {title}")
    
    return experience if experience else ['Experience not clearly specified']

def generate_improvements(text):
    improvements = []
    word_count = len(text.split())
    
    if word_count < 300:
        improvements.append("Add more detail to your CV")
    if not any(word.lower() in text.lower() for word in ['achieved', 'accomplished', 'improved']):
        improvements.append("Include more achievements and quantifiable results")
    if not any(word.lower() in text.lower() for word in ['certification', 'certified', 'degree']):
        improvements.append("Add relevant certifications or educational qualifications")
    
    return improvements if improvements else ["CV looks good, consider adding more specific achievements"]

def extract_categories_from_text(text):
    categories = set()
    category_keywords = {
        'Software Development': ['developer', 'programming', 'software', 'web'],
        'Data Science': ['data', 'analytics', 'machine learning', 'ai'],
        'Design': ['design', 'ui', 'ux', 'graphic'],
        'Management': ['manager', 'lead', 'supervisor', 'head'],
    }
    
    for category, keywords in category_keywords.items():
        if any(keyword.lower() in text.lower() for keyword in keywords):
            categories.add(category)
    
    return list(categories) if categories else ['General']

def calculate_cv_score(cv_text, skills, experience):
    # Calculate CV completeness score
    score = 0
    if len(skills) > 3: score += 20
    if len(experience) > 1: score += 20
    if len(cv_text.split()) > 200: score += 20
    if any('year' in exp.lower() for exp in experience): score += 20
    if any(skill.lower() in cv_text.lower() for skill in skills): score += 20
    return score

def extract_years_of_experience(experience_list):
    for exp in experience_list:
        if 'year' in exp.lower():
            years = ''.join(filter(str.isdigit, exp))
            if years:
                return int(years)
    return None

def calculate_skill_match(cv_skills, job_skills):
    if not cv_skills or not job_skills:
        return 0
    
    cv_skills_set = set(skill.lower() for skill in cv_skills)
    job_skills_set = set(skill.lower() for skill in job_skills)
    
    matching_skills = cv_skills_set.intersection(job_skills_set)
    return round((len(matching_skills) / len(job_skills_set)) * 100, 2)

def analyze_cv_from_pdf_url(pdf_url, cv_analyzer):
    """Main function to analyze a CV from a PDF URL."""
    # Extract text from PDF
    cv_text = extract_text_from_pdf(pdf_url)
    if not cv_text:
        return {'error': 'Could not extract text from PDF'}
    
    # Analyze CV text
    analysis = analyze_cv_with_model(cv_text, cv_analyzer)
    
    # Parse results
    parsed_results = parse_llm_output(analysis)
    
    # Fallback to regex extraction if LLM fails
    if not parsed_results['skills']:
        parsed_results['skills'] = extract_skills_from_text(cv_text)
    if not parsed_results['experience']:
        parsed_results['experience'] = extract_experience_from_text(cv_text)
    if not parsed_results['improvements']:
        parsed_results['improvements'] = generate_improvements(cv_text)
    if not parsed_results['categories']:
        parsed_results['categories'] = extract_categories_from_text(cv_text)
    
    return {
        'skills': parsed_results['skills'],
        'experience': parsed_results['experience'],
        'improvements': parsed_results['improvements'],
        'categories': parsed_results['categories'],
        'score': parsed_results['score'],
        'analysis': analysis
    }