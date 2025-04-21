import asyncio
import json
import os
from datetime import datetime
from playwright.async_api import async_playwright
from job_processor import LinkedInJobProcessor

MAX_JOBS = 1000
INITIAL_URL = "https://www.linkedin.com/jobs/search/?keywords=Software%20Developer&location=Sri%20Lanka&geoId=100446352&trk=public_jobs_jobs-search-bar_search-submit&position=1"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "public", "data", "linkedin_jobs.json")

async def scrape_linkedin_jobs():
    try:
        all_jobs = []
        seen_job_ids = set()
        last_job_count = 0
        stuck_count = 0

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                viewport={"width": 1200, "height": 2000},
                # Consider adding cookies if you have a LinkedIn account
                # storage_state="linkedin_cookies.json"
            )
            page = await context.new_page()

            await page.goto(INITIAL_URL, timeout=60000)
            await page.wait_for_selector("div.base-card", timeout=30000)

            while len(all_jobs) < MAX_JOBS and stuck_count < 5:
                print(f"\nProcessing... Total jobs collected: {len(all_jobs)}")

                # Scroll in increments to trigger loading
                for _ in range(3):
                    await page.evaluate('window.scrollBy(0, 800)')
                    await asyncio.sleep(0.3)  # Small delay between scrolls

                # Wait for content to load
                await asyncio.sleep(1.5)

                # Extract jobs
                jobs = await page.evaluate('''() => {
                    const cards = Array.from(document.querySelectorAll('div.base-card'));
                    return cards.map(job => ({
                        title: job.querySelector('h3.base-search-card__title')?.innerText?.trim() || '',
                        company: job.querySelector('h4.base-search-card__subtitle a')?.innerText?.trim() || '',
                        location: job.querySelector('span.job-search-card__location')?.innerText?.trim() || '',
                        posted_date: job.querySelector('time.job-search-card__listdate')?.innerText?.trim() || '',
                        job_url: job.querySelector('a.base-card__full-link')?.href || '',
                        listing_id: job.getAttribute('data-entity-urn') || ''
                    })).filter(job => job.listing_id);
                }''')

                # Process new jobs
                new_jobs = [job for job in jobs if job['listing_id'] not in seen_job_ids]
                
                if new_jobs:
                    all_jobs.extend(new_jobs)
                    seen_job_ids.update(job['listing_id'] for job in new_jobs)
                    print(f"Added {len(new_jobs)} new jobs")
                    stuck_count = 0  # Reset stuck counter
                else:
                    stuck_count += 1
                    print(f"No new jobs found (attempt {stuck_count}/5)")

                    # Try alternative methods to load more jobs
                    try:
                        # Click "See more jobs" button if visible
                        await page.click('button.infinite-scroller__show-more-button', timeout=2000)
                        print("Clicked 'See more jobs' button")
                        await asyncio.sleep(2)
                    except:
                        # Scroll to very bottom as last resort
                        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                        await asyncio.sleep(2)

            # After scraping, process jobs
            processor = LinkedInJobProcessor()
            
            # Process new jobs
            processor.process_jobs(all_jobs)
            
            # Remove expired jobs
            processor.remove_expired_jobs()

            print(f"\nFinished! Processed {len(all_jobs)} jobs and updated Qdrant database")
            await browser.close()
            return True

    except Exception as e:
        print(f"Fatal error: {str(e)}")
        return False

if __name__ == "__main__":
    asyncio.run(scrape_linkedin_jobs())