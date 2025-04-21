from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import pandas as pd

def scrape_topjobs():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=False)  # Set headless=True for production
        page = browser.new_page(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        
        # Navigate to page
        page.goto("https://www.topjobs.lk/applicant/vacancybyfunctionalarea.jsp?FA=SDQ", timeout=60000)
        
        # Wait for content to load
        page.wait_for_selector("tr[id^='tr']", timeout=10000)
        
        # Get page content
        html = page.content()
        soup = BeautifulSoup(html, 'html.parser')
        
        # Extract job listings
        jobs = []
        for row in soup.select("tr[id^='tr']"):
            job = {
                'listing_number': row.select_one("td:first-child").get_text(strip=True),
                'vacancy_number': row.select_one("td:nth-child(2)").get_text(strip=True),
                'job_title': row.select_one("td:nth-child(3) h2 span").get_text(strip=True),
                'company': row.select_one("td:nth-child(3) h1").get_text(strip=True),
                'description': row.select_one("td:nth-child(4)").get_text(strip=True),
                'opening_date': row.select_one("td:nth-child(5)").get_text(strip=True),
                'closing_date': row.select_one("td:nth-child(6)").get_text(strip=True),
                'location': row.select_one("td:nth-child(7)").get_text(strip=True),
                'hidden_jc': row.select_one("span[id^='hdnJC']").get_text(strip=True) if row.select_one("span[id^='hdnJC']") else None,
                'hidden_ec': row.select_one("span[id^='hdnEC']").get_text(strip=True) if row.select_one("span[id^='hdnEC']") else None,
                'onclick': row.get('onclick')
            }
            jobs.append(job)
        
        browser.close()
        return jobs

# Run scraper
jobs = scrape_topjobs()

# Save to JSON
import json
with open('topjobs_listings.json', 'w', encoding='utf-8') as f:
    json.dump(jobs, f, indent=4, ensure_ascii=False)
print("Saved to topjobs_listings.json")