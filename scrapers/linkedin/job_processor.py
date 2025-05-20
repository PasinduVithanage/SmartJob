from datetime import datetime, timedelta
import json
from qdrant_client import QdrantClient
from qdrant_client.http import models
from sentence_transformers import SentenceTransformer
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LinkedInJobProcessor:
    def __init__(self):
        self.qdrant = QdrantClient("localhost", port=6333)
        # Using a smaller, efficient model
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Ensure collection exists
        self._init_collection()

    def _init_collection(self):
        try:
            # Try to delete existing collection if it exists
            try:
                self.qdrant.delete_collection("jobs")
            except:
                pass
            
            # Create new collection with correct vector size
            self.qdrant.create_collection(
                collection_name="jobs",
                vectors_config=models.VectorParams(
                    size=384,  # Match the dimension of all-MiniLM-L6-v2 model
                    distance=models.Distance.COSINE
                )
            )
        except Exception as e:
            logger.error(f"Failed to initialize collection: {str(e)}")

    def _create_job_embedding(self, job):
        # Create text for embedding
        text = f"{job['title']} {job['company']} {job['location']}"
        # Get embedding as a list
        return self.model.encode(text).tolist()

    def _convert_listing_id(self, listing_id):
        # Extract the numeric part from the LinkedIn listing ID
        try:
            return int(listing_id.split(':')[-1])
        except:
            # Fallback to hash if conversion fails
            return abs(hash(listing_id))
    
    def process_jobs(self, jobs):
        # Get existing job IDs from Qdrant
        existing_ids = set()
        offset = 0
        logger.info("Starting to fetch existing jobs...")
        
        while True:
            points = self.qdrant.scroll(
                collection_name="jobs",
                offset=offset,
                limit=100,
                with_payload=True
            )[0]
            if not points:
                logger.info(f"Finished fetching existing jobs. Total found: {len(existing_ids)}")
                break
            existing_ids.update(p.id for p in points)
            offset += len(points)
            logger.info(f"Fetched batch of {len(points)} jobs. Total so far: {len(existing_ids)}")
    
        # Process new jobs and updates
        logger.info(f"Processing {len(jobs)} new jobs...")
        for job in jobs:
            # Convert LinkedIn listing ID to valid Qdrant point ID
            job_id = self._convert_listing_id(job['listing_id'])
            
            # Skip if job already exists
            if job_id in existing_ids:
                continue
    
            # Create embedding
            embedding = self._create_job_embedding(job)
            
            # Add timestamp for expiry checking
            job['processed_timestamp'] = datetime.now().isoformat()
            
            # Upload to Qdrant
            self.qdrant.upsert(
                collection_name="jobs",
                points=[
                    models.PointStruct(
                        id=job_id,
                        vector=embedding,
                        payload=job
                    )
                ]
            )

    def remove_expired_jobs(self, days_threshold=30):
        # Calculate cutoff date
        cutoff_date = datetime.now() - timedelta(days=days_threshold)
        
        # Get all points
        offset = 0
        while True:
            points = self.qdrant.scroll(
                collection_name="jobs",
                offset=offset,
                limit=100,
                with_payload=True
            )[0]
            
            if not points:
                break
                
            # Find expired jobs
            expired_ids = []
            for point in points:
                processed_date = datetime.fromisoformat(
                    point.payload.get('processed_timestamp', datetime.now().isoformat())
                )
                if processed_date < cutoff_date:
                    expired_ids.append(point.id)
            
            # Delete expired jobs
            if expired_ids:
                self.qdrant.delete(
                    collection_name="jobs",
                    points_selector=models.PointIdsList(
                        points=expired_ids
                    )
                )
            
            offset += len(points)