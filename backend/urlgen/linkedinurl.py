from urllib.parse import quote

def generate_linkedin_job_search_url(
    keywords: str = "",
    location: str = "",
    geoId: str = None,  # e.g., "100446352" for Sri Lanka
    job_type: list = None,  # ["F", "P", "C", "T", "I"] (Full-time, Part-time, etc.)
    experience_level: list = None,  # [1, 2, 3, 4, 5] (Internship, Entry-level, etc.)
    date_posted: str = None,  # "r86400" (24h), "r604800" (week), "r2592000" (month)
    remote: bool = False,
    company: str = "",
    industry: str = "",
    trk: str = "public_jobs_jobs-search-bar_search-submit",  # Default tracking parameter
) -> str:
    """
    Generates a LinkedIn job search URL matching the format:
    https://www.linkedin.com/jobs/search?keywords=Python&location=Sri%20Lanka&geoId=100446352&trk=public_jobs_jobs-search-bar_search-submit&position=1&pageNum=0

    Args:
        keywords (str): Job title or skills (e.g., "Python Developer").
        location (str): Location name (e.g., "Sri Lanka").
        geoId (str): LinkedIn's geoId for the location (e.g., "100446352" for Sri Lanka).
        job_type (list): LinkedIn job type codes - "F" (Full-time), "P" (Part-time), etc.
        experience_level (list): Experience codes - 1 (Intern), 2 (Entry), etc.
        date_posted (str): Time filter - "r86400" (24h), "r604800" (1 week).
        remote (bool): Only remote jobs if True.
        company (str): Filter by company name.
        industry (str): Industry (e.g., "Information Technology").
        trk (str): Tracking parameter (default: "public_jobs_jobs-search-bar_search-submit").

    Returns:
        str: LinkedIn jobs search URL with all parameters.

    Example:
        url = generate_linkedin_job_search_url(
            keywords="Python Developer",
            location="Sri Lanka",
            geoId="100446352",
            trk="public_jobs_jobs-search-bar_search-submit",
        )
    """
    base_url = "https://www.linkedin.com/jobs/search/"
    
    # Default parameters (from your example)
    params = {
        "keywords": quote(keywords) if keywords else "",
        "location": quote(location) if location else "",
        "geoId": geoId,
        "trk": trk,
        "position": 1,
        "pageNum": 0,
    }
    
    # Optional filters
    if job_type:
        params["f_JT"] = ",".join(job_type)  # "F,P,C" for Full, Part, Contract
    if experience_level:
        params["f_E"] = ",".join(map(str, experience_level))
    if date_posted:
        params["f_TPR"] = date_posted
    if remote:
        params["f_WT"] = "2"  # LinkedIn's code for remote
    if company:
        params["f_C"] = quote(company)
    if industry:
        params["f_I"] = quote(industry)
    
    # Remove empty params
    params = {k: v for k, v in params.items() if v}
    
    # Build query string
    query_string = "&".join(f"{k}={v}" for k, v in params.items())
    
    return f"{base_url}?{query_string}"