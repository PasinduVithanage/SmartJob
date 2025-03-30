# Job Scraping Platform

## Overview
This project is a job search platform that aggregates job vacancies from various sources like LinkedIn and Topjobs using web scrapers. It centralizes job listings, allowing users to browse opportunities, upload CVs, use advanced filters, and receive tailored recommendations.

## Project Structure
```
job-scraping-platform/
│-- backend/          # FastAPI backend for data processing and API handling
│-- frontend/         # React + Tailwind CSS frontend for the user interface
│-- scrapers/         # Crawl4AI and Scrapy-based web scrapers
│-- README.md        # Project documentation
│-- requirements.txt  # Backend dependencies
│-- package.json      # Frontend dependencies
```

## Technologies Used
### Backend
- **FastAPI**: API development and data handling
- **Python**: Backend development
- **Qdrant**: Vector database for job and CV data comparison

### Frontend
- **React**: Frontend framework
- **Tailwind CSS**: Styling and UI design
- **React Router**: Routing for navigation
- **Zustand**: State management

### Scrapers
- **Scrapy**: Web scraping framework
- **Crawl4AI**: AI-powered scraping

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
4. Run the FastAPI server:
   ```sh
   uvicorn main:app --reload
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

### Scraper Setup
1. Navigate to the scrapers folder:
   ```sh
   cd scrapers
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Run the scrapers:
   ```sh
   scrapy crawl job_spider
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

