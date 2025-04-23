from flask import Flask, jsonify, request
from flask_cors import CORS
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer

app = Flask(__name__)
CORS(app)

# Initialize the sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

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

if __name__ == '__main__':
    app.run(debug=True)