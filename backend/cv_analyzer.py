# import requests
# import re
# import io
# import PyPDF2
# import os
# import json
# from dotenv import load_dotenv
# import google.generativeai as genai

# # Load environment variables
# load_dotenv()
# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# # Configure Gemini API
# genai.configure(api_key=GEMINI_API_KEY)

# def extract_text_from_pdf(pdf_url):
#     """Extracts text from a PDF file given its URL."""
#     try:
#         response = requests.get(pdf_url)
#         pdf_file = io.BytesIO(response.content)
#         pdf_reader = PyPDF2.PdfReader(pdf_file)
#         text = ' '.join([page.extract_text() or "" for page in pdf_reader.pages])
#         return text.strip()
#     except Exception as e:
#         print(f"PDF extraction error: {e}")
#         return ""

# def analyze_cv_with_gemini(cv_text):
#     """Analyze CV text using Google's Gemini API."""
#     try:
#         # Create a more structured prompt for better results
#         prompt = f"""You are an expert CV analyzer. Analyze the following CV content and provide a structured response.

# CV Content:
# {cv_text[:3000]}

# Please analyze this CV and provide the following information in a structured format:

# Technical Skills:
# - List all technical skills mentioned (programming languages, tools, platforms)

# Soft Skills:
# - List all soft skills mentioned (communication, leadership, etc.)

# Experience:
# - Extract years of experience
# - List all roles and positions mentioned
# - Extract company names if available

# Improvements:
# - Provide specific suggestions to improve this CV
# - Identify any missing important sections
# - Suggest ways to better highlight achievements

# Categories:
# - List suitable job categories for this candidate
# - Suggest potential career paths

# Score:
# - Rate this CV on a scale of 0-100 based on completeness, clarity, and relevance

# Format your response with clear section headers and bullet points.
# """

#         # Initialize Gemini model
#         model = genai.GenerativeModel('gemini-pro')
        
#         # Generate response
#         response = model.generate_content(prompt)
        
#         return response.text
#     except Exception as e:
#         print(f"Gemini API error: {e}")
#         return ""

# def parse_gemini_output(analysis_text):
#     """Parse Gemini API output into structured fields."""
#     try:
#         # Split into sections more reliably
#         sections = analysis_text.split('\n\n')
#         results = {
#             'skills': [],
#             'experience': [],
#             'improvements': [],
#             'categories': [],
#             'score': 70
#         }
        
#         current_section = None
#         for section in sections:
#             section = section.strip()
            
#             # More robust section detection
#             if 'Technical Skills:' in section or 'Skills:' in section:
#                 skills = [s.strip('- ').strip() for s in section.split('\n')[1:]]
#                 results['skills'].extend([s for s in skills if s and not s.startswith('skill')])
#             elif 'Soft Skills:' in section:
#                 skills = [s.strip('- ').strip() for s in section.split('\n')[1:]]
#                 results['skills'].extend([s for s in skills if s and not s.startswith('skill')])
#             elif 'Experience:' in section:
#                 exp = [e.strip('- ').strip() for e in section.split('\n')[1:]]
#                 results['experience'].extend([e for e in exp if e and not e.startswith('experience')])
#             elif 'Improvements:' in section or 'Improvement:' in section:
#                 imp = [i.strip('- ').strip() for i in section.split('\n')[1:]]
#                 results['improvements'].extend([i for i in imp if i and not i.startswith('improve')])
#             elif 'Categories:' in section or 'Category:' in section:
#                 cat = [c.strip('- ').strip() for c in section.split('\n')[1:]]
#                 results['categories'].extend([c for c in cat if c and not c.startswith('categor')])
#             elif 'Score:' in section:
#                 score_line = [line for line in section.split('\n') if 'Score:' in line]
#                 if score_line:
#                     score_text = score_line[0]
#                     score = ''.join(filter(str.isdigit, score_text))
#                     if score:
#                         results['score'] = min(max(int(score[:3]), 0), 100)

#         # Clean up and ensure no empty lists
#         for key in results:
#             if isinstance(results[key], list):
#                 results[key] = [item for item in results[key] if item]
#                 if not results[key]:
#                     if key == 'skills':
#                         results[key] = extract_skills_from_text(analysis_text)
#                     elif key == 'experience':
#                         results[key] = extract_experience_from_text(analysis_text)
#                     elif key == 'improvements':
#                         results[key] = generate_improvements(analysis_text)
#                     elif key == 'categories':
#                         results[key] = extract_categories_from_text(analysis_text)
                        
#         return results
        
#     except Exception as e:
#         print(f"Parse error: {str(e)}")
#         return {
#             'skills': extract_skills_from_text(analysis_text),
#             'experience': extract_experience_from_text(analysis_text),
#             'improvements': generate_improvements(analysis_text),
#             'categories': extract_categories_from_text(analysis_text),
#             'score': calculate_cv_score(analysis_text, [], [])
#         }

# def extract_skills_from_text(text):
#     """Extract skills using regex patterns and common skill keywords."""
#     common_skills = [
#         'python', 'javascript', 'react', 'node.js', 'typescript', 
#         'java', 'c++', 'c#', '.net', 'sql', 'nosql', 'mongodb', 'postgresql',
#         'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
#         'git', 'jenkins', 'jira', 'agile', 'scrum', 'devops',
#         'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',
#         'machine learning', 'ai', 'data science', 'data analysis',
#         'excel', 'powerpoint', 'word', 'office', 'photoshop', 'illustrator',
#         'communication', 'leadership', 'teamwork', 'problem solving'
#     ]
    
#     found_skills = []
#     text_lower = text.lower()
    
#     for skill in common_skills:
#         if skill in text_lower:
#             found_skills.append(skill)
    
#     # Look for skill sections
#     skill_pattern = r'(?:skills|technologies|tools|languages)(?:[\s\:\-]+)(.*?)(?:\n\n|\Z)'
#     skill_sections = re.findall(skill_pattern, text_lower, re.DOTALL)
    
#     for section in skill_sections:
#         # Extract individual skills from lists
#         skill_items = re.findall(r'[\•\-\*\★\✓]\s*([^\n\•\-\*\★\✓]+)', section)
#         for item in skill_items:
#             item = item.strip()
#             if item and len(item) > 2 and item not in found_skills:
#                 found_skills.append(item)
    
#     return found_skills if found_skills else ['No specific skills detected']

# def extract_experience_from_text(text):
#     """Extract experience information using regex patterns."""
#     experience = []
#     text_lower = text.lower()
    
#     # Extract years of experience
#     year_pattern = r'(\d+)[\s-]*(year|yr)s?\s*(of)?\s*experience'
#     matches = re.finditer(year_pattern, text_lower)
#     for match in matches:
#         experience.append(f"{match.group(1)} years experience")
    
#     # Extract job titles and companies
#     job_titles = [
#         'developer', 'engineer', 'manager', 'analyst', 'designer', 'consultant',
#         'director', 'specialist', 'coordinator', 'administrator', 'technician',
#         'architect', 'lead', 'head', 'chief', 'officer', 'ceo', 'cto', 'cfo'
#     ]
    
#     # Look for experience sections
#     exp_pattern = r'(?:experience|work|employment|career)(?:[\s\:\-]+)(.*?)(?:\n\n|\Z)'
#     exp_sections = re.findall(exp_pattern, text_lower, re.DOTALL)
    
#     for section in exp_sections:
#         # Extract job positions
#         for title in job_titles:
#             if title in section:
#                 # Try to find company name near job title
#                 company_pattern = r'(?:' + title + r')\s+(?:at|with|for)?\s+([A-Z][A-Za-z\s]+)'
#                 companies = re.findall(company_pattern, section, re.IGNORECASE)
                
#                 if companies:
#                     experience.append(f"Worked as {title} at {companies[0].strip()}")
#                 else:
#                     experience.append(f"Worked as {title}")
    
#     # Extract date ranges for employment
#     date_pattern = r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s+(?:-|to|–)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}'
#     dates = re.findall(date_pattern, text, re.IGNORECASE)
    
#     if dates and not experience:
#         experience.append(f"Has work experience with {len(dates)} previous positions")
    
#     return experience if experience else ['Experience not clearly specified']

# def generate_improvements(text):
#     """Generate improvement suggestions based on CV content."""
#     improvements = []
#     word_count = len(text.split())
    
#     if word_count < 300:
#         improvements.append("Add more detail to your CV - aim for at least 400-600 words")
    
#     # Check for key sections
#     if not re.search(r'(education|university|college|degree|diploma|bachelor|master|phd)', text.lower()):
#         improvements.append("Add an Education section with your qualifications")
    
#     if not re.search(r'(skill|proficien|competen)', text.lower()):
#         improvements.append("Include a dedicated Skills section highlighting your technical and soft skills")
    
#     if not re.search(r'(experience|work|employment|career)', text.lower()):
#         improvements.append("Add a Work Experience section detailing your previous roles")
    
#     if not re.search(r'(achieve|accomplish|result|impact|improve|increase|decrease|develop|create|implement)', text.lower()):
#         improvements.append("Include quantifiable achievements and results in your experience descriptions")
    
#     if not re.search(r'(contact|email|phone|linkedin|github)', text.lower()):
#         improvements.append("Add complete contact information including email, phone, and professional profiles")
    
#     return improvements if improvements else ["CV looks good, consider adding more specific achievements with measurable results"]

# def extract_categories_from_text(text):
#     """Extract suitable job categories based on CV content."""
#     categories = set()
#     text_lower = text.lower()
    
#     category_keywords = {
#         'Software Development': ['developer', 'programming', 'software', 'web', 'code', 'coding'],
#         'Data Science': ['data', 'analytics', 'machine learning', 'ai', 'statistics', 'analysis'],
#         'Design': ['design', 'ui', 'ux', 'graphic', 'creative', 'visual'],
#         'Management': ['manager', 'lead', 'supervisor', 'head', 'director', 'chief'],
#         'Marketing': ['marketing', 'seo', 'content', 'social media', 'brand', 'digital marketing'],
#         'Finance': ['finance', 'accounting', 'financial', 'budget', 'audit', 'tax'],
#         'Healthcare': ['health', 'medical', 'clinical', 'nurse', 'doctor', 'patient'],
#         'Education': ['teacher', 'professor', 'instructor', 'tutor', 'education', 'teaching'],
#         'Engineering': ['engineer', 'engineering', 'mechanical', 'electrical', 'civil', 'structural'],
#         'Sales': ['sales', 'account manager', 'business development', 'client', 'customer']
#     }
    
#     for category, keywords in category_keywords.items():
#         if any(keyword in text_lower for keyword in keywords):
#             categories.add(category)
    
#     # Check for specific degrees that might indicate categories
#     if re.search(r'(computer science|cs degree|software engineering)', text_lower):
#         categories.add('Software Development')
    
#     if re.search(r'(business administration|mba|business management)', text_lower):
#         categories.add('Management')
    
#     return list(categories) if categories else ['General']

# def calculate_cv_score(cv_text, skills, experience):
#     """Calculate a comprehensive CV score based on multiple factors."""
#     # Calculate CV completeness score
#     score = 0
#     text_lower = cv_text.lower()
    
#     # Skills score (max 20)
#     if len(skills) > 5: 
#         score += 20
#     elif len(skills) > 3:
#         score += 15
#     elif len(skills) > 0:
#         score += 10
    
#     # Experience score (max 20)
#     if len(experience) > 2: 
#         score += 20
#     elif len(experience) > 1:
#         score += 15
#     elif len(experience) > 0:
#         score += 10
    
#     # Content length score (max 15)
#     word_count = len(cv_text.split())
#     if word_count > 500: 
#         score += 15
#     elif word_count > 300:
#         score += 10
#     elif word_count > 200:
#         score += 5
    
#     # Key sections score (max 25)
#     sections = 0
#     if re.search(r'(education|university|college|degree)', text_lower): sections += 1
#     if re.search(r'(experience|work|employment)', text_lower): sections += 1
#     if re.search(r'(skill|proficien|competen)', text_lower): sections += 1
#     if re.search(r'(project|portfolio)', text_lower): sections += 1
#     if re.search(r'(contact|email|phone)', text_lower): sections += 1
#     score += sections * 5
    
#     # Achievement focus score (max 20)
#     achievement_words = ['achieved', 'improved', 'increased', 'decreased', 'developed', 
#                          'created', 'implemented', 'managed', 'led', 'coordinated']
#     achievement_count = sum(1 for word in achievement_words if word in text_lower)
#     if achievement_count > 5:
#         score += 20
#     elif achievement_count > 3:
#         score += 15
#     elif achievement_count > 0:
#         score += 10
    
#     return score

# def extract_years_of_experience(experience_list):
#     """Extract years of experience from experience descriptions."""
#     for exp in experience_list:
#         if 'year' in exp.lower():
#             years = ''.join(filter(str.isdigit, exp))
#             if years:
#                 return int(years)
#     return None

# def calculate_skill_match(cv_skills, job_skills):
#     """Calculate percentage match between CV skills and job requirements."""
#     if not cv_skills or not job_skills:
#         return 0
    
#     cv_skills_set = set(skill.lower() for skill in cv_skills)
#     job_skills_set = set(skill.lower() for skill in job_skills)
    
#     matching_skills = cv_skills_set.intersection(job_skills_set)
#     return round((len(matching_skills) / len(job_skills_set)) * 100, 2)

# def analyze_cv_from_pdf_url(pdf_url):
#     """Main function to analyze a CV from a PDF URL using Gemini API."""
#     # Extract text from PDF
#     cv_text = extract_text_from_pdf(pdf_url)
#     if not cv_text:
#         return {'error': 'Could not extract text from PDF'}
    
#     # Analyze CV text with Gemini
#     analysis = analyze_cv_with_gemini(cv_text)
    
#     # Parse results
#     parsed_results = parse_gemini_output(analysis)
    
#     # Fallback to regex extraction if Gemini fails
#     if not parsed_results['skills']:
#         parsed_results['skills'] = extract_skills_from_text(cv_text)
#     if not parsed_results['experience']:
#         parsed_results['experience'] = extract_experience_from_text(cv_text)
#     if not parsed_results['improvements']:
#         parsed_results['improvements'] = generate_improvements(cv_text)
#     if not parsed_results['categories']:
#         parsed_results['categories'] = extract_categories_from_text(cv_text)
    
#     return {
#         'skills': parsed_results['skills'],
#         'experience': parsed_results['experience'],
#         'improvements': parsed_results['improvements'],
#         'categories': parsed_results['categories'],
#         'score': parsed_results['score'],
#         'analysis': analysis
#     }