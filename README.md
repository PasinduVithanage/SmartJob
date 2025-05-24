# Job Scraping Platform

## Overview
This project is a job search platform that aggregates job vacancies from various sources like LinkedIn and Topjobs using web scrapers. It centralizes job listings, allowing users to browse opportunities, upload CVs, use advanced filters, and receive tailored recommendations.

## Project Structure
```
job-scraping-platform/
│-- backend/          # Flask backend for data processing and API handling
│-- frontend/         # React + Tailwind CSS frontend for the user interface
│-- scrapers/         # Playwright and Scrapy-based web scrapers
│-- README.md        # Project documentation
│-- requirements.txt  # Backend dependencies
│-- package.json      # Frontend dependencies
```

## Technologies Used
### Backend
- **Flask**: API development and data handling
- **Python**: Backend development
- **Qdrant**: Vector database for job and CV data comparison

### Frontend
- **React**: Frontend framework
- **Tailwind CSS**: Styling and UI design
- **React Router**: Routing for navigation
- **Zustand**: State management

### Scrapers
- **Scrapy**: Web scraping framework
- **Playwright**: Web scraping framework

## Setup Instructions
### Backend Setup
1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Create and activate a virtual environment:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Run the Flask server:
   ```sh
   python app.py
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

This project includes automated web scrapers that are hosted and scheduled to run daily at midnight. These scrapers are responsible for collecting and updating job listings from external sources.

✅ Key Points:
Scrapers run automatically on the hosting server every night at 12:00 AM (midnight).

The scraping task is handled using a scheduler (e.g., cron on Linux, Task Scheduler on Windows, or APScheduler in Python).

Scraped data is stored in the database used by the backend and made available through the API.

This ensures the platform always provides up-to-date job listings.

📌 You can test or trigger the scraper manually by running the appropriate script inside the backend folder.

## Scrapers Setup
1. Navigate to the scrapers folder:
   ```sh
   cd scrapers
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   python -m playwright install
   ```
3. Run the scrapers:
   ```sh
   python unified_scraper.py
   ```

## Features
- Job aggregation from multiple sources
- Advanced filtering and search
- AI-based job and CV matching
- Real-time job updates

## Contribution
Feel free to open issues and submit pull requests to improve the platform!

## License
This project is licensed under the MIT License.

