from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

def init_qdrant():
    try:
        client = QdrantClient("localhost", port=6333)
        
        # Create jobs collection if it doesn't exist
        collections = client.get_collections().collections
        if not any(c.name == "jobs" for c in collections):
            client.create_collection(
                collection_name="jobs",
                vectors_config=VectorParams(size=384, distance=Distance.COSINE)
            )
            print("Jobs collection created successfully")
        else:
            print("Jobs collection already exists")
            
    except Exception as e:
        print(f"Error initializing Qdrant: {str(e)}")

if __name__ == "__main__":
    init_qdrant()