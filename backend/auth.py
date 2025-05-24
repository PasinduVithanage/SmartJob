from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib
import uuid
import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse

# Load environment variables
load_dotenv()

# Get Qdrant configuration
def get_qdrant_client():
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    
    if qdrant_url and qdrant_api_key:
        # Use cloud Qdrant
        return QdrantClient(
            url=qdrant_url,
            api_key=qdrant_api_key,
        )
    else:
        # Fallback to local Qdrant
        return QdrantClient("localhost", port=6333)

# Initialize Qdrant client
qdrant_client = get_qdrant_client()

# Remove the Flask app creation from this file
# app = Flask(__name__)
# CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# REMOVE THIS LINE:
# qdrant_client = QdrantClient(host="localhost", port=6333)

# Create users collection if it doesn't exist
try:
    # First try to get the collection to see if it exists
    qdrant_client.get_collection("users")
    print("Users collection already exists")
    
    # Add index for email field if it doesn't exist
    try:
        qdrant_client.create_payload_index(
            collection_name="users",
            field_name="email",
            field_schema=models.PayloadSchemaType.KEYWORD
        )
        print("Created index for email field")
    except Exception as e:
        if "already exists" in str(e):
            print("Email index already exists")
        else:
            print(f"Error creating email index: {str(e)}")
            
except Exception as e:
    # Only create if it doesn't exist
    try:
        qdrant_client.create_collection(
            collection_name="users",
            vectors_config=models.VectorParams(size=1, distance=models.Distance.COSINE),
        )
        print("Created users collection")
        
        # Create index for email field
        qdrant_client.create_payload_index(
            collection_name="users",
            field_name="email",
            field_schema=models.PayloadSchemaType.KEYWORD
        )
        print("Created index for email field")
    except UnexpectedResponse as e:
        # If we get a 409 Conflict, the collection already exists
        if "already exists" in str(e):
            print("Users collection already exists (caught in create)")
        else:
            # Re-raise if it's a different error
            raise

# Helper function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Define functions without the app.route decorator
def signup_handler():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    # Check if user already exists using scroll instead of search
    scroll_result = qdrant_client.scroll(
        collection_name="users",
        scroll_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="email",
                    match=models.MatchValue(value=email)
                )
            ]
        ),
        limit=1
    )[0]  # Get the points from the tuple (points, next_page_offset)
    
    if scroll_result:
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
    
    # Store user in Qdrant - using upsert instead of upsert_points
    qdrant_client.upsert(
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

def login_handler():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    # Search for user by email using scroll instead of search
    scroll_result = qdrant_client.scroll(
        collection_name="users",
        scroll_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="email",
                    match=models.MatchValue(value=email)
                )
            ]
        ),
        limit=1
    )[0]  # Get the points from the tuple (points, next_page_offset)
    
    if not scroll_result:
        return jsonify({"error": "Invalid email or password"}), 401
    
    user = scroll_result[0].payload
    
    # Verify password
    if user["password"] != hash_password(password):
        return jsonify({"error": "Invalid email or password"}), 401
    
    # Return user data (excluding password)
    user_data = user.copy()
    del user_data["password"]
    
    return jsonify({"user": user_data}), 200