import schedule
import time
import asyncio
from linkscrape import scrape_linkedin_jobs

def job():
    print(f"Starting job scrape at {datetime.now()}")
    asyncio.run(scrape_linkedin_jobs())

def main():
    # Schedule job to run at midnight
    schedule.every().day.at("00:00").do(job)
    
    # Run job immediately on start
    job()
    
    # Keep running
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    main()