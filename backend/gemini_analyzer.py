import google.generativeai as genai
import os
import json
import time
import random
from dotenv import load_dotenv
from qdrant_client import QdrantClient

# Load environment variables
load_dotenv()

# Get API key
api_key = os.getenv("GEMINI_API_KEY")

# Configure Gemini API
if api_key:
    genai.configure(api_key=api_key)

AVAILABLE_MODELS = [ "gemini-2.0-flash"]

def analyze_cv(cv_json):
    """
    Analyze CV using Gemini API or fallback on quota limit or error.
    """
    if not api_key:
        print("No Gemini API key found. Using fallback analysis.")
        return fallback_cv_analysis(cv_json)

    prompt = f"""
    Here's a CV JSON:
    {cv_json}

    Analyze this CV and provide the following information in a structured format:

    Technical Skills:
    - List all technical skills mentioned
    - Rate each skill on a scale of 1-5

    Soft Skills:
    - List all soft skills

    Experience:
    - Years of experience
    - Roles and industry sectors

    Education:
    - Degrees and certifications

    Improvements:
    - Specific suggestions to improve the CV

    Categories:
    - Suggested job categories and 3-5 job titles

    Score:
    - Rate the CV out of 100
    - Subscores: Skills (0–25), Experience (0–25), Education (0–25), Presentation (0–25)

    Format clearly with headers and bullet points.
    """

    for model_name in AVAILABLE_MODELS:
        retry_count = 0
        max_retries = 3

        while retry_count < max_retries:
            try:
                model = genai.GenerativeModel(model_name=model_name)
                response = model.generate_content(prompt)
                print(f"Success with model: {model_name}")
                return response.text

            except Exception as e:
                error_message = str(e)
                print(f"Model {model_name} error: {error_message}")

                if "429" in error_message:
                    # Rate limit exceeded
                    retry_seconds = 10 * (2 ** retry_count) + random.uniform(0, 3)
                    print(f"Rate limit exceeded on {model_name}. Retrying in {retry_seconds:.2f} seconds...")
                    time.sleep(retry_seconds)
                    retry_count += 1
                else:
                    # Any other error, break and try next model
                    print(f"Switching model due to error: {model_name}")
                    break

    # If all models fail
    print("All Gemini models failed or quota exceeded. Using fallback.")
    return fallback_cv_analysis(cv_json)

def fallback_cv_analysis(cv_json):
    try:
        cv_data = json.loads(cv_json) if isinstance(cv_json, str) else cv_json
        skills = cv_data.get('skills', [])
        exp_data = cv_data.get('experience', [])

        experience = []
        for exp in exp_data:
            if isinstance(exp, dict):
                title = exp.get('title', '')
                company = exp.get('company', '')
                if title and company:
                    experience.append(f"{title} at {company}")
                elif title or company:
                    experience.append(title or f"Worked at {company}")

        improvements = []
        if not skills:
            improvements.append("Add a skills section")
        if not exp_data:
            improvements.append("Add detailed work experience")
        if not cv_data.get('education'):
            improvements.append("Include your education")
        if not cv_data.get('summary') and not cv_data.get('objective'):
            improvements.append("Add a professional summary or objective")

        categories = []
        tech_keywords = ['developer', 'engineer', 'software']
        business_keywords = ['manager', 'analyst']

        combined_text = ' '.join(skills + experience).lower()
        if any(kw in combined_text for kw in tech_keywords):
            categories.append("Technology")
        if any(kw in combined_text for kw in business_keywords):
            categories.append("Business")
        if not categories:
            categories.append("General")

        score = 0
        score += 25 if skills else 0
        score += 25 if experience else 0
        score += 25 if cv_data.get('education') else 0
        score += 25 if cv_data.get('summary') or cv_data.get('objective') else 0

        return f"""
        Technical Skills:
        {chr(10).join(['- ' + skill for skill in skills[:10]]) or '- None listed'}

        Experience:
        {chr(10).join(['- ' + exp for exp in experience[:5]]) or '- None listed'}

        Improvements:
        {chr(10).join(['- ' + i for i in improvements])}

        Categories:
        {chr(10).join(['- ' + c for c in categories])}

        Score:
        - {score}/100
        """
    except Exception as e:
        print(f"Fallback error: {str(e)}")
        return """
        Technical Skills:
        - None detected

        Experience:
        - None detected

        Improvements:
        - Add skills
        - Include work experience

        Categories:
        - General

        Score:
        - 50/100
        """

def parse_gemini_output(analysis_text):
    """Parse Gemini API output into structured fields."""
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
            section = section.strip()
            
            # More robust section detection
            if 'Technical Skills:' in section or 'Skills:' in section:
                skills = [s.strip('- ').strip() for s in section.split('\n')[1:]]
                results['skills'].extend([s for s in skills if s and not s.startswith('skill')])
            elif 'Soft Skills:' in section:
                skills = [s.strip('- ').strip() for s in section.split('\n')[1:]]
                results['skills'].extend([s for s in skills if s and not s.startswith('skill')])
            elif 'Experience:' in section:
                exp = [e.strip('- ').strip() for e in section.split('\n')[1:]]
                results['experience'].extend([e for e in exp if e and not e.startswith('experience')])
            elif 'Improvements:' in section or 'Improvement:' in section:
                imp = [i.strip('- ').strip() for i in section.split('\n')[1:]]
                results['improvements'].extend([i for i in imp if i and not i.startswith('improve')])
            elif 'Categories:' in section or 'Category:' in section:
                cat = [c.strip('- ').strip() for c in section.split('\n')[1:]]
                results['categories'].extend([c for c in cat if c and not c.startswith('categor')])
            elif 'Score:' in section:
                score_line = [line for line in section.split('\n') if 'Score:' in line]
                if score_line:
                    score_text = score_line[0]
                    score = ''.join(filter(str.isdigit, score_text))
                    if score:
                        results['score'] = min(max(int(score[:3]), 0), 100)

        # Clean up and ensure no empty lists
        for key in results:
            if isinstance(results[key], list):
                results[key] = [item for item in results[key] if item]
                if not results[key]:
                    if key == 'skills':
                        results[key] = ['No specific skills detected']
                    elif key == 'experience':
                        results[key] = ['No experience detected']
                    elif key == 'improvements':
                        results[key] = ['Add more details to your CV']
                    elif key == 'categories':
                        results[key] = ['General']
                        
        return results
        
    except Exception as e:
        print(f"Parse error: {str(e)}")
        return {
            'skills': ['No specific skills detected'],
            'experience': ['No experience detected'],
            'improvements': ['Add more details to your CV'],
            'categories': ['General'],
            'score': 50
        }

def find_matching_jobs(skills, categories, threshold=0.6):
    """Find matching jobs based on skills, categories, and other criteria using traditional filtering."""
    try:
        client = QdrantClient("localhost", port=6333)
        
        # Create filter conditions
        filter_conditions = []
        
        # Extract job titles from categories (assuming job titles are in categories)
        job_titles = [cat for cat in categories if not cat.startswith("Technology") and not cat.startswith("Business")]
        
        # Add job title filter if available
        if job_titles:
            title_conditions = []
            for title in job_titles:
                title_conditions.append({
                    "key": "title",
                    "match": {"text": title}
                })
            if len(title_conditions) > 1:
                filter_conditions.append({"should": title_conditions})
            else:
                filter_conditions.append(title_conditions[0])
        
        # Add skills filter
        if skills:
            skill_conditions = []
            for skill in skills:
                skill_conditions.append({
                    "key": "skills",
                    "match": {"text": skill}
                })
            if len(skill_conditions) > 1:
                filter_conditions.append({"should": skill_conditions})
            else:
                filter_conditions.append(skill_conditions[0])
        
        # Add category filter (Technology, Business, etc.)
        category_filters = [cat for cat in categories if cat.startswith("Technology") or cat.startswith("Business")]
        if category_filters:
            category_conditions = []
            for category in category_filters:
                category_conditions.append({
                    "key": "category",
                    "match": {"text": category}
                })
            if len(category_conditions) > 1:
                filter_conditions.append({"should": category_conditions})
            else:
                filter_conditions.append(category_conditions[0])
        
        # Construct the final filter
        final_filter = {"must": filter_conditions} if filter_conditions else None
        
        # Scroll through all jobs with the filter
        search_result = client.scroll(
            collection_name="jobs",
            scroll_filter=final_filter,
            limit=10,
            with_payload=True
        )[0]  # [0] gets the points, [1] gets the next_page_offset
        
        # Convert results to JSON-serializable format
        matching_jobs = [
            {
                'id': result.id,
                'payload': result.payload,
                'score': 1.0  # Default score since we're not using vector search
            }
            for result in search_result
        ]
        
        return matching_jobs
        
    except Exception as e:
        print(f"Job matching error: {str(e)}")
        return []

# Example usage:
skills = ["Python", "Machine Learning"]
categories = ["Technology"]
matching_jobs = find_matching_jobs(skills, categories, threshold=0.6)
print(matching_jobs)
