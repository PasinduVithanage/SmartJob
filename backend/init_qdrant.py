from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
import os
from dotenv import load_dotenv

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

def init_qdrant():
    try:
        client = get_qdrant_client()
        
        # Create jobs collection if it doesn't exist
        collections = client.get_collections().collections
        if not any(c.name == "jobs" for c in collections):
            client.create_collection(
                collection_name="jobs",
                vectors_config=VectorParams(size=384, distance=Distance.COSINE)
            )
            print("Jobs collection created successfully")
            
            # Create text indexes for filtering
            client.create_payload_index(
                collection_name="jobs",
                field_name="title",
                field_schema="text"
            )
            client.create_payload_index(
                collection_name="jobs",
                field_name="skills",
                field_schema="text"
            )
            client.create_payload_index(
                collection_name="jobs",
                field_name="category",
                field_schema="text"
            )
            print("Created text indexes for title, skills, and category fields")
        else:
            print("Jobs collection already exists")
            
            # Try to create indexes if they don't exist
            try:
                client.create_payload_index(
                    collection_name="jobs",
                    field_name="title",
                    field_schema="text"
                )
                print("Created text index for title field")
            except Exception as e:
                if "already exists" in str(e):
                    print("Title index already exists")
                else:
                    print(f"Error creating title index: {str(e)}")
                    
            try:
                client.create_payload_index(
                    collection_name="jobs",
                    field_name="skills",
                    field_schema="text"
                )
                print("Created text index for skills field")
            except Exception as e:
                if "already exists" in str(e):
                    print("Skills index already exists")
                else:
                    print(f"Error creating skills index: {str(e)}")
                    
            try:
                client.create_payload_index(
                    collection_name="jobs",
                    field_name="category",
                    field_schema="text"
                )
                print("Created text index for category field")
            except Exception as e:
                if "already exists" in str(e):
                    print("Category index already exists")
                else:
                    print(f"Error creating category index: {str(e)}")
            
    except Exception as e:
        print(f"Error initializing Qdrant: {str(e)}")

if __name__ == "__main__":
    init_qdrant()