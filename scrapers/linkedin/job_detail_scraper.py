from playwright.async_api import async_playwright
import asyncio
from bs4 import BeautifulSoup
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def scrape_job_details(job_url: str):
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = await context.new_page()
            
            # Navigate to job page
            await page.goto(job_url, timeout=30000)
            await page.wait_for_selector('.job-view-layout', timeout=10000)
            
            # Extract detailed job information
            job_details = await page.evaluate('''() => {
                return {
                    description: document.querySelector('.description__text')?.innerText?.trim() || '',
                    seniority: document.querySelector('.description__job-criteria-text:nth-child(1)')?.innerText?.trim() || 'Not specified',
                    employment_type: document.querySelector('.description__job-criteria-text:nth-child(2)')?.innerText?.trim() || 'Not specified',
                    job_function: document.querySelector('.description__job-criteria-text:nth-child(3)')?.innerText?.trim() || 'Not specified',
                    industries: document.querySelector('.description__job-criteria-text:nth-child(4)')?.innerText?.trim() || 'Not specified',
                    skills: Array.from(document.querySelectorAll('.skill-pill')).map(skill => skill.innerText.trim()),
                    company_details: document.querySelector('.company-description')?.innerText?.trim() || '',
                    qualifications: document.querySelector('.qualifications-section')?.innerText?.trim() || '',
                    benefits: document.querySelector('.benefits-section')?.innerText?.trim() || '',
                    applicant_count: document.querySelector('.num-applicants__caption')?.innerText?.trim() || 'Not available',
                    salary_range: document.querySelector('.compensation__salary-range')?.innerText?.trim() || 'Not disclosed',
                    work_type: document.querySelector('.workplace-type')?.innerText?.trim() || 'Not specified'
                };
            }''')
            
            await browser.close()
            return job_details

    except Exception as e:
        logger.error(f"Error scraping job details: {str(e)}")
        return {
            'error': f"Failed to scrape job details: {str(e)}",
            'status': 'error'
        }

# Example usage
if __name__ == "__main__":
    test_url = "https://www.linkedin.com/jobs/view/123456789"
    asyncio.run(scrape_job_details(test_url))