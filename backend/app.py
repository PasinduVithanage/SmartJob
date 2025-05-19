from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
import os
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from pdf_to_json import extract_text_from_pdf, cv_to_json
from gemini_analyzer import analyze_cv, parse_gemini_output, find_matching_jobs

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Load environment variables
load_dotenv()

# Initialize models
model = SentenceTransformer('all-MiniLM-L6-v2')

# Define upload configuration
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

@app.route('/api/analyze-cv', methods=['POST'])
def analyze_cv_endpoint():
    try:
        data = request.json
        cv_url = data.get('cvUrl')
        
        if not cv_url:
            return jsonify({'error': 'CV URL is required'}), 400
            
        # Extract the filename from the URL
        filename = cv_url.split('/')[-1]
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Check if file exists
        if not os.path.exists(filepath):
            return jsonify({'error': 'CV file not found'}), 404
            
        # Extract text from PDF
        cv_text = extract_text_from_pdf(filepath)
        
        # Convert to JSON format
        cv_json = cv_to_json(cv_text)
        
        # Analyze the CV using Gemini
        analysis_text = analyze_cv(cv_json)
        
        # Parse the analysis into structured data
        try:
            parsed_analysis = parse_gemini_output(analysis_text)
            
            # Find matching jobs based on skills and categories
            matching_jobs = find_matching_jobs(parsed_analysis['skills'], parsed_analysis['categories'])
            
            # Return the analysis and job recommendations
            return jsonify({
                'skills': parsed_analysis['skills'],
                'experience': parsed_analysis['experience'],
                'improvements': parsed_analysis['improvements'],
                'categories': parsed_analysis['categories'],
                'score': parsed_analysis['score'],
                'matchedJobs': len(matching_jobs),
                'recommendations': matching_jobs
            })
        except Exception as inner_e:
            print(f"Parsing error: {str(inner_e)}")
            return jsonify({'error': f'Error parsing CV analysis: {str(inner_e)}'}), 500
        
    except Exception as e:
        print(f"CV Analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

if __name__ == '__main__':
    app.run(debug=True)