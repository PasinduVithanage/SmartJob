from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib
import uuid
from qdrant_client import QdrantClient
from qdrant_client.http import models

app = Flask(__name__)
CORS(app)

# Initialize Qdrant client
qdrant_client = QdrantClient(host="localhost", port=6333)

# Create users collection if it doesn't exist
try:
    qdrant_client.get_collection("users")
except Exception:
    qdrant_client.create_collection(
        collection_name="users",
        vectors_config=models.VectorParams(size=1, distance=models.Distance.COSINE),
    )

# Helper function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    # Check if user already exists
    search_result = qdrant_client.search(
        collection_name="users",
        query_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="email",
                    match=models.MatchValue(value=email)
                )
            ]
        ),
        limit=1
    )
    
    if search_result:
        return jsonify({"error": "User already exists"}), 400
    
    # Create new user
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "name": name,
        "email": email,
        "password": hash_password(password),
        "isAdmin": False,
        "savedJobs": [],
        "appliedJobs": []
    }
    
    # Store user in Qdrant
    qdrant_client.upload_points(
        collection_name="users",
        points=[
            models.PointStruct(
                id=user_id,
                vector=[0.0],  # Dummy vector since we're using Qdrant as a document store
                payload=user
            )
        ]
    )
    
    # Return user data (excluding password)
    user_data = user.copy()
    del user_data["password"]
    
    return jsonify({"user": user_data}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    # Search for user by email
    search_result = qdrant_client.search(
        collection_name="users",
        query_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="email",
                    match=models.MatchValue(value=email)
                )
            ]
        ),
        limit=1
    )
    
    if not search_result:
        return jsonify({"error": "Invalid email or password"}), 401
    
    user = search_result[0].payload
    
    # Verify password
    if user["password"] != hash_password(password):
        return jsonify({"error": "Invalid email or password"}), 401
    
    # Return user data (excluding password)
    user_data = user.copy()
    del user_data["password"]
    
    return jsonify({"user": user_data}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)