from qdrant_client import QdrantClient
from qdrant_client.http import models
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

def init_database():
    try:
        # Connect to Qdrant
        client = get_qdrant_client()
        
        # Create jobs collection with updated vector size
        client.recreate_collection(
            collection_name="jobs",
            vectors_config=models.VectorParams(
                size=384,  # Updated to match SentenceTransformer model
                distance=models.Distance.COSINE
            ),
            hnsw_config=models.HnswConfigDiff(
                m=16,
                ef_construct=100
            ),
            optimizers_config=models.OptimizersConfigDiff(
                default_segment_number=2
            )
        )

        # Create field indexes
        client.create_payload_index(
            collection_name="jobs",
            field_name="title",
            field_schema=models.PayloadSchemaType.KEYWORD
        )
        client.create_payload_index(
            collection_name="jobs",
            field_name="company",
            field_schema=models.PayloadSchemaType.KEYWORD
        )
        client.create_payload_index(
            collection_name="jobs",
            field_name="location",
            field_schema=models.PayloadSchemaType.KEYWORD
        )
        client.create_payload_index(
            collection_name="jobs",
            field_name="posted_date",
            field_schema=models.PayloadSchemaType.KEYWORD
        )
        client.create_payload_index(
            collection_name="jobs",
            field_name="processed_timestamp",
            field_schema=models.PayloadSchemaType.DATETIME
        )
        
        logger.info("Database initialized successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        return False

if __name__ == "__main__":
    init_database()