import json
from job_processor import LinkedInJobProcessor

def test_database():
    try:
        # Load sample jobs from the JSON file using absolute path
        with open('e:/University/Final year/SmartJob/frontend/public/data/linkedin_jobs.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            jobs = data.get('jobs', [])

        # Initialize the job processor
        processor = LinkedInJobProcessor()

        # Process the jobs
        processor.process_jobs(jobs)
        print(f"Successfully processed {len(jobs)} jobs")

        # Test removing expired jobs
        processor.remove_expired_jobs(days_threshold=30)
        print("Successfully tested expired job removal")

    except Exception as e:
        print(f"Error during testing: {str(e)}")

if __name__ == "__main__":
    test_database()