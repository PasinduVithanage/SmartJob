import asyncio
import sys
import os

# Fix import paths
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)
sys.path.append(current_dir)

from scrapers.linkedin.linkscrape import scrape_linkedin_jobs
from scrapers.topjobs.topjob import scrape_topjobs, TopJobsProcessor
from scrapers.linkedin.job_processor import LinkedInJobProcessor
from qdrant_client import QdrantClient
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_unified_scraper():
    try:
        # Initialize processors
        linkedin_processor = LinkedInJobProcessor()
        topjobs_processor = TopJobsProcessor()
        
        # Clean up expired and redundant data
        logger.info("Cleaning up expired and redundant jobs...")
        try:
            # Remove expired jobs (older than 30 days)
            linkedin_processor.remove_expired_jobs(days_threshold=30)
            
            # Remove duplicate jobs based on listing ID
            client = QdrantClient("localhost", port=6333)
            seen_listings = set()
            to_delete = []
            offset = 0
            
            while True:
                points = client.scroll(
                    collection_name="jobs",
                    offset=offset,
                    limit=100,
                    with_payload=True
                )[0]
                
                if not points:
                    break
                    
                for point in points:
                    listing_id = point.payload.get('listing_id')
                    if listing_id in seen_listings:
                        to_delete.append(point.id)
                    else:
                        seen_listings.add(listing_id)
                
                offset += len(points)
            
            if to_delete:
                client.delete(
                    collection_name="jobs",
                    points_selector=models.PointIdsList(points=to_delete)
                )
                logger.info(f"Removed {len(to_delete)} duplicate jobs")
                
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")
        
        # Run LinkedIn scraper first
        logger.info("Starting LinkedIn scraper...")
        try:
            linkedin_data = await scrape_linkedin_jobs()
            if linkedin_data and len(linkedin_data) > 0:
                logger.info(f"Found {len(linkedin_data)} LinkedIn listings")
                # Add source field if not present
                for job in linkedin_data:
                    job['source'] = 'linkedin'
                linkedin_processor.process_jobs(linkedin_data)
                logger.info("LinkedIn jobs processed and stored in database")
            else:
                logger.error("No LinkedIn data returned")
        except Exception as e:
            logger.error(f"LinkedIn scraping failed: {str(e)}")
            
        # Run TopJobs scraper after LinkedIn
        logger.info("Starting TopJobs scraper...")
        try:
            topjobs_data = await scrape_topjobs()
            if topjobs_data:
                logger.info(f"Found {len(topjobs_data)} TopJobs listings")
                # Add source field for TopJobs
                for job in topjobs_data:
                    job['source'] = 'topjobs'
                topjobs_processor.process_jobs(topjobs_data)
                logger.info("TopJobs data processed and stored successfully")
            else:
                logger.error("No TopJobs data returned")
        except Exception as e:
            logger.error(f"TopJobs scraping failed: {str(e)}")
        
        logger.info("All scraping completed!")
        return True
        
    except Exception as e:
        logger.error(f"Error in unified scraper: {str(e)}")
        return False

def get_all_jobs():
    try:
        client = QdrantClient("localhost", port=6333)
        
        # Get all jobs without any filters
        all_jobs = []
        offset = 0
        
        while True:
            points = client.scroll(
                collection_name="jobs",
                offset=offset,
                limit=100,
                with_payload=True,
                with_vectors=False
            )[0]
            
            if not points:
                break
                
            jobs = [{
                'id': point.id,
                'payload': point.payload,
                'source': point.payload.get('source', 'linkedin')  # Default to linkedin for older entries
            } for point in points]
            
            all_jobs.extend(jobs)
            offset += len(points)
        
        return all_jobs
        
    except Exception as e:
        logger.error(f"Error fetching jobs: {str(e)}")
        return []

if __name__ == "__main__":
    # Run scrapers
    asyncio.run(run_unified_scraper())
    
    # Get all jobs
    jobs = get_all_jobs()
    logger.info(f"Total jobs in database: {len(jobs)}")
    logger.info(f"LinkedIn jobs: {sum(1 for job in jobs if job['source'] == 'linkedin')}")
    logger.info(f"TopJobs jobs: {sum(1 for job in jobs if job['source'] == 'topjobs')}")