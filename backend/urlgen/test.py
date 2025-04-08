from linkedinurl import generate_linkedin_job_search_url

# Generate a URL like the one you provided
url = generate_linkedin_job_search_url(
    keywords="Software Developer",
    location="Sri Lanka",
    geoId="100446352",  # Sri Lanka's geoId
    trk="public_jobs_jobs-search-bar_search-submit",
)

print("Generated URL:", url)