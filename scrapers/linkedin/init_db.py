from qdrant_client import QdrantClient
from qdrant_client.http import models
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database():
    try:
        # Connect to Qdrant
        client = QdrantClient("localhost", port=6333)
        
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