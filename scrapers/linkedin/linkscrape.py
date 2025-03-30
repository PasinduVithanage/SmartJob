import sys
import os
import json
import asyncio
import random
from datetime import datetime
from crawl4ai import AsyncWebCrawler, CacheMode
from crawl4ai.extraction_strategy import JsonCssExtractionStrategy
from crawl4ai.async_configs import BrowserConfig, CrawlerRunConfig

sys.stdout.reconfigure(encoding="utf-8")
os.environ["PYTHONIOENCODING"] = "utf-8"

MAX_PAGES = 3
INITIAL_URL = "https://www.linkedin.com/jobs/search/?keywords=Software%20Engineer&location=United%20States"

async def scrape_linkedin_jobs():
    try:
        # Configure browser
        browser_config = BrowserConfig(
            browser_type="chromium",
            headless=False,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )

        # Extraction schema
        job_schema = {
            "name": "LinkedIn Jobs",
            "baseSelector": "div.base-card",
            "fields": [
                {"name": "title", "selector": "h3.base-search-card__title", "type": "text"},
                {"name": "company", "selector": "h4.base-search-card__subtitle a", "type": "text"},
                {"name": "location", "selector": "span.job-search-card__location", "type": "text"},
                {"name": "posted_date", "selector": "time.job-search-card__listdate", "type": "text"},
                {"name": "job_url", "selector": "a.base-card__full-link", "type": "attribute", "attribute": "href"},
                {"name": "listing_id", "selector": "div.base-card", "type": "attribute", "attribute": "data-entity-urn"}
            ]
        }

        all_jobs = []
        current_page = 0

        async with AsyncWebCrawler(config=browser_config) as crawler:
            while current_page < MAX_PAGES:
                print(f"\nScraping page {current_page + 1}")
                
                try:
                    # Configure crawler for each page
                    crawler_config = CrawlerRunConfig(
                        cache_mode=CacheMode.BYPASS,
                        page_timeout=30000,
                        wait_until="domcontentloaded",
                        extraction_strategy=JsonCssExtractionStrategy(
                            verbose=False,
                            schema=job_schema
                        )
                    )

                    # Get results
                    result = await crawler.arun(
                        url=f"{INITIAL_URL}&start={current_page * 25}",
                        config=crawler_config
                    )

                    # Debugging output
                    print("\nResult object properties:", dir(result))
                    if hasattr(result, 'extracted_content'):
                        print(f"Extracted content length: {len(result.extracted_content)}")
                    
                    # Process results
                    if result and result.extracted_content:
                        try:
                            jobs = json.loads(result.extracted_content)
                            if jobs:
                                all_jobs.extend(jobs)
                                print(f"Added {len(jobs)} jobs (Total: {len(all_jobs)})")
                            else:
                                print("No jobs found in extracted content")
                        except Exception as e:
                            print(f"JSON parsing error: {str(e)}")
                    else:
                        print("No content extracted")

                except Exception as e:
                    print(f"Page {current_page + 1} failed: {str(e)}")

                current_page += 1
                await asyncio.sleep(random.uniform(2, 5))

        # Save results
        if all_jobs:
            filename = f"linkedin_jobs_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
            with open(filename, "w", encoding="utf-8") as f:
                json.dump({
                    "meta": {
                        "total_jobs": len(all_jobs),
                        "pages_scraped": current_page,
                        "timestamp": datetime.now().isoformat()
                    },
                    "jobs": all_jobs
                }, f, ensure_ascii=False, indent=2)
            
            print(f"\nSuccessfully saved {len(all_jobs)} jobs to {filename}")
            return True

        return False

    except Exception as e:
        print(f"Fatal error: {str(e)}")
        return False

if __name__ == "__main__":
    asyncio.run(scrape_linkedin_jobs())