import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            viewport={"width": 1280, "height": 720}
        )
        url = "https://www.linkedin.com/jobs/search?keywords=software%20engineer&location=United%20States"
        
        print("Navigating to LinkedIn...")
        await page.goto(url, wait_until="domcontentloaded")
        
        # Dismiss any modal if present
        modal = await page.query_selector(".modal__overlay--visible")
        if modal:
            print("Dismissing modal...")
            await page.evaluate("document.querySelector('.modal__overlay--visible').style.display = 'none';")
        
        print("Scrolling page to load all jobs...")
        for _ in range(3):
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
            await asyncio.sleep(3)

        jobs = await page.query_selector_all(".job-search-card")
        print(f"Found {len(jobs)} jobs. Listing all:")
        
        for i, job in enumerate(jobs, 1):
            # Extract fields from search page
            title = await (await job.query_selector(".base-search-card__title")).inner_text() if await job.query_selector(".base-search-card__title") else "No title"
            company = await (await job.query_selector(".base-search-card__subtitle")).inner_text() if await job.query_selector(".base-search-card__subtitle") else "No company"
            location = await (await job.query_selector(".job-search-card__location")).inner_text() if await job.query_selector(".job-search-card__location") else "No location"
            date = await (await job.query_selector(".job-search-card__listdate")).inner_text() if await job.query_selector(".job-search-card__listdate") else "No date"
            job_url = await (await job.query_selector("a.base-card__full-link")).get_attribute("href") if await job.query_selector("a.base-card__full-link") else "No URL"
            
            # Try clicking for details, fall back to job URL if it fails
            desc = "No description"
            skills_text = "No skills listed"
            try:
                await job.click(timeout=5000)  # Reduced timeout
                await asyncio.sleep(2)
                desc_elem = await page.query_selector(".description__text")
                desc = await desc_elem.inner_text() if desc_elem else "No description"
                skills = [await s.inner_text() for s in await page.query_selector_all(".job-details-skill-match-status-list__item")] or ["No skills listed"]
                skills_text = ", ".join(skills[:5])
            except Exception as e:
                print(f"Click failed for job {i}: {str(e)}. Fetching from job URL...")
                job_page = await browser.new_page()
                await job_page.goto(job_url, wait_until="domcontentloaded")
                desc_elem = await job_page.query_selector(".description__text")
                desc = await desc_elem.inner_text() if desc_elem else "No description"
                skills = [await s.inner_text() for s in await job_page.query_selector_all(".job-details-skill-match-status-list__item")] or ["No skills listed"]
                skills_text = ", ".join(skills[:5])
                await job_page.close()

            print(f"{i}. Title: {title}")
            print(f"   Company: {company}")
            print(f"   Location: {location}")
            print(f"   Posted: {date}")
            print(f"   Job URL: {job_url}")
            print(f"   Description: {desc[:100]}...")
            print(f"   Skills: {skills_text}")
            print("-" * 50)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())