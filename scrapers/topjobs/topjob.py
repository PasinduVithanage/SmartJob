import asyncio
import aiohttp
import os
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from datetime import datetime
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from playwright.async_api import async_playwright
import logging

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'backend', '.env'))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TopJobsProcessor:
    def __init__(self):
        # Get Qdrant configuration
        qdrant_url = os.getenv("QDRANT_URL")
        qdrant_api_key = os.getenv("QDRANT_API_KEY")
        
        if qdrant_url and qdrant_api_key:
            # Use cloud Qdrant
            self.qdrant = QdrantClient(
                url=qdrant_url,
                api_key=qdrant_api_key,
            )
        else:
            # Fallback to local Qdrant
            self.qdrant = QdrantClient("localhost", port=6333)
            
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def _create_job_embedding(self, job):
        text = f"{job['title']} {job['company']} {job['location']}"
        return self.model.encode(text).tolist()

    def process_jobs(self, jobs):
        for job in jobs:
            try:
                # Convert TopJobs format to LinkedIn schema with correct URL format
                processed_job = {
                    'title': job['job_title'],
                    'company': job['company'],
                    'location': job['location'],
                    'type': 'Full Time',
                    'posted_date': job['opening_date'],
                    'description': job['description'],
                    'job_url': f"https://topjobs.lk/employer/JobAdvertismentServlet?rid=0&ac=DEFZZZ&jc={job['vacancy_number']}&ec=DEFZZZ&pg=applicant/vacancybyfunctionalarea.jsp",
                    'listing_id': f"topjobs:{job['vacancy_number']}",
                    'source': 'topjobs',
                    'processed_timestamp': datetime.now().isoformat()
                }

                # Create embedding
                job_vector = self._create_job_embedding(processed_job)

                # Store in Qdrant
                self.qdrant.upsert(
                    collection_name="jobs",
                    points=[{
                        'id': abs(hash(processed_job['listing_id'])),
                        'vector': job_vector,
                        'payload': processed_job
                    }]
                )
                logger.info(f"Processed job: {processed_job['title']}")

            except Exception as e:
                logger.error(f"Error processing job {job.get('job_title', 'Unknown')}: {str(e)}")

async def scrape_topjobs():
    logger.info("Initializing TopJobs scraper...")
    try:
        async with async_playwright() as p:
            logger.info("Launching browser...")
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
            
            logger.info("Navigating to TopJobs...")
            await page.goto("https://www.topjobs.lk/applicant/vacancybyfunctionalarea.jsp?FA=SDQ", timeout=60000)
            
            logger.info("Waiting for job listings...")
            await page.wait_for_selector("tr[id^='tr']", timeout=10000)
            
            logger.info("Extracting job data...")
            html = await page.content()
            soup = BeautifulSoup(html, 'html.parser')
            
            jobs = []
            for row in soup.select("tr[id^='tr']"):
                try:
                    job = {
                        'listing_number': row.select_one("td:first-child").get_text(strip=True),
                        'vacancy_number': row.select_one("td:nth-child(2)").get_text(strip=True),
                        'job_title': row.select_one("td:nth-child(3) h2 span").get_text(strip=True),
                        'company': row.select_one("td:nth-child(3) h1").get_text(strip=True),
                        'description': row.select_one("td:nth-child(4)").get_text(strip=True),
                        'opening_date': row.select_one("td:nth-child(5)").get_text(strip=True),
                        'closing_date': row.select_one("td:nth-child(6)").get_text(strip=True),
                        'location': row.select_one("td:nth-child(7)").get_text(strip=True),
                    }
                    jobs.append(job)
                except Exception as e:
                    logger.error(f"Error processing row: {str(e)}")
            
            logger.info(f"Found {len(jobs)} jobs")
            await browser.close()
            return jobs

    except Exception as e:
        logger.error(f"TopJobs scraping error: {str(e)}")
        return []

if __name__ == "__main__":
    # Scrape jobs
    jobs = scrape_topjobs()
    
    # Process and store jobs
    processor = TopJobsProcessor()
    processor.process_jobs(jobs)
    
    logger.info("TopJobs scraping and processing completed")