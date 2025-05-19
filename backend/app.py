from flask import Flask, jsonify, request
from flask_cors import CORS
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
import PyPDF2
import io
import requests
from transformers import pipeline
from werkzeug.utils import secure_filename
import os
from flask import send_from_directory

app = Flask(__name__)
CORS(app)

# Add at the top with other imports
# text_generator = pipeline('text-generation', model='TinyLlama/TinyLlama-1.1B-Chat-v1.0')

# Update imports and model initialization
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch

# Import from our new cv_analyzer module
from cv_analyzer import analyze_cv_from_pdf_url, extract_years_of_experience, calculate_skill_match

# Initialize models
model = SentenceTransformer('all-MiniLM-L6-v2')

# Use a smaller, publicly available model
cv_analyzer = pipeline(
    "text-generation",
    model="facebook/opt-350m",  # Smaller, public model
    tokenizer="facebook/opt-350m",
    device="cpu"
)

# Remove the Llama-2 initialization
# tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-chat-hf")
# llm_model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-chat-hf")

# Update the analyze_cv function
@app.route('/api/analyze-cv', methods=['POST'])
def analyze_cv():
    try:
        data = request.json
        cv_url = data.get('cvUrl')
        
        # Download and extract text from PDF
        response = requests.get(cv_url)
        pdf_file = io.BytesIO(response.content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        cv_text = ' '.join([page.extract_text() for page in pdf_reader.pages])

        # Prepare prompt for CV analysis
        prompt = f"""Analyze this CV and provide detailed insights:

CV Content: {cv_text[:1500]}

Please provide:
1. List of technical and soft skills
2. Years of experience and roles
3. Specific areas for improvement
4. Best matching job categories
5. Overall CV strength score (0-100)
"""

        # Generate CV analysis using the pipeline
        analysis = cv_analyzer(
            prompt,
            max_length=1000,
            num_return_sequences=1,
            temperature=0.7,
            top_p=0.95,
        )[0]['generated_text']

        # Rest of the function remains the same
        parsed_results = parse_llm_output(analysis)
        cv_embedding = model.encode(cv_text)
        matched_jobs = find_matching_jobs(cv_embedding, parsed_results['categories'])
        
        return jsonify({
            'skills': parsed_results['skills'],
            'experience': parsed_results['experience'],
            'improvements': parsed_results['improvements'],
            'categories': parsed_results['categories'],
            'score': parsed_results['score'],
            'matchedJobs': len(matched_jobs),
            'analysis': analysis
        })
        
    except Exception as e:
        print(f"CV Analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Remove @app.before_first_request as it's deprecated in newer Flask versions
# Instead, initialize what you need when creating the app
# Define upload configuration before init_app
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), 'uploads'))
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

def init_app():
    # Initialize your app configurations here
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

# Call initialization when creating the app
init_app()

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        client = QdrantClient("localhost", port=6333)
        
        # Fetch all jobs from Qdrant
        points = client.scroll(
            collection_name="jobs",
            limit=1000,  # Adjust limit as needed
            with_payload=True,
            with_vectors=False
        )[0]
        
        # Convert points to JSON-serializable format
        jobs = [
            {
                'id': point.id,
                'payload': point.payload
            }
            for point in points
        ]
        
        return jsonify(jobs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/search-jobs', methods=['POST'])
def search_jobs():
    load_models()  # Load models only when needed
    try:
        search_data = request.json
        query = search_data.get('query', '')
        location = search_data.get('location')
        skills = search_data.get('skills', [])
        job_type = search_data.get('jobType')
        page = search_data.get('page', 1)
        per_page = search_data.get('per_page', 20)

        # Create search text combining query and filters
        search_text = query
        if skills:
            search_text += f" {' '.join(skills)}"
        if job_type:
            search_text += f" {job_type}"

        # Generate embedding for search query
        query_vector = model.encode(search_text).tolist()

        # Create filter conditions
        filter_conditions = []
        if location:
            filter_conditions.append({
                "key": "location",
                "match": {"text": location}
            })
        if job_type:
            filter_conditions.append({
                "key": "type",
                "match": {"text": job_type}
            })

        # Connect to Qdrant
        client = QdrantClient("localhost", port=6333)
        
        # Search with filters and score threshold
        search_result = client.search(
            collection_name="jobs",
            query_vector=query_vector,
            query_filter={"must": filter_conditions} if filter_conditions else None,
            limit=100,  # Get more results for filtering
            score_threshold=0.3  # Only return relevant matches
        )

        # Sort by score and get the most relevant jobs
        sorted_jobs = sorted(search_result, key=lambda x: x.score, reverse=True)
        
        # Apply pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_jobs = sorted_jobs[start_idx:end_idx]

        # Convert results to JSON-serializable format
        jobs = [
            {
                'id': result.id,
                'payload': result.payload,
                'score': round(result.score, 4)  # Round score for readability
            }
            for result in paginated_jobs
        ]
        
        return jsonify({
            'status': 'success',
            'data': jobs,
            'total': len(sorted_jobs),
            'page': page,
            'per_page': per_page,
            'total_pages': (len(sorted_jobs) + per_page - 1) // per_page
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

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
    import re
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

def find_matching_jobs(cv_embedding, categories):
    # Find matching jobs using vector similarity
    client = QdrantClient("localhost", port=6333)
    
    search_result = client.search(
        collection_name="jobs",
        query_vector=cv_embedding.tolist(),
        limit=20
    )
    
    return search_result

# Update imports at the top
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
import PyPDF2
import io
import os
import requests
from transformers import pipeline
from werkzeug.utils import secure_filename

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        print(f"File serving error: {str(e)}")
        return jsonify({'error': 'File not found'}), 404

@app.route('/api/upload-cv', methods=['POST'])
def upload_cv():
    try:
        if 'cv' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
            
        file = request.files['cv']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Return the URL that can be used to access the file
            file_url = f'http://localhost:5000/uploads/{filename}'
            
            # Verify file exists after saving
            if not os.path.exists(filepath):
                return jsonify({'error': 'File save failed'}), 500
                
            return jsonify({'cvUrl': file_url})
            
        return jsonify({'error': 'Invalid file type'}), 400
        
    except Exception as e:
        print(f"Upload error: {str(e)}")
        return jsonify({'error': str(e)}), 500

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/analyze-cv-and-find-jobs', methods=['POST'])
def analyze_cv_and_find_jobs():
    try:
        data = request.json
        cv_url = data.get('cvUrl')
        if not cv_url:
            return jsonify({'error': 'No CV URL provided'}), 400
            
        # Get the analyzer model
        analyzer = get_cv_analyzer()
        
        # Use the function from cv_analyzer.py
        results = analyze_cv_from_pdf_url(cv_url, analyzer)
        
        # Create search query from CV data
        search_text = " ".join([
            " ".join(results['skills']),
            " ".join(results['experience']),
            " ".join(results['categories'])
        ])
        
        # Generate embedding for search
        query_vector = model.encode(search_text).tolist()
        
        # Create filter conditions based on CV analysis
        filter_conditions = []
        
        # Add category filters
        if results['categories']:
            filter_conditions.append({
                "should": [
                    {"key": "category", "match": {"text": category}}
                    for category in results['categories']
                ]
            })
        
        # Add experience filter if available
        experience_years = extract_years_of_experience(results['experience'])
        if experience_years:
            filter_conditions.append({
                "key": "experience",
                "match": {"text": str(experience_years)}
            })
        
        # Search for matching jobs
        client = QdrantClient("localhost", port=6333)
        search_result = client.search(
            collection_name="jobs",
            query_vector=query_vector,
            query_filter={"must": filter_conditions} if filter_conditions else None,
            limit=20,
            score_threshold=0.6
        )
        
        # Process and sort results
        matching_jobs = [
            {
                'id': result.id,
                'payload': result.payload,
                'matchScore': round(result.score * 100, 2),
                'skillMatch': calculate_skill_match(
                    results['skills'],
                    result.payload.get('skills', [])
                )
            }
            for result in search_result
        ]
        
        # Sort by match score and skill match
        matching_jobs.sort(key=lambda x: (x['matchScore'], x['skillMatch']), reverse=True)
        
        return jsonify({
            'analysis': {
                'skills': results['skills'],
                'experience': results['experience'],
                'improvements': results['improvements'],
                'categories': results['categories'],
                'score': results['score']
            },
            'matchingJobs': matching_jobs,
            'totalMatches': len(matching_jobs)
        })
        
    except Exception as e:
        print(f"CV Analysis and Job Search error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)