interface QdrantJob {
  id: number;
  payload: {
    title: string;
    company: string;
    location: string;
    posted_date: string;
    job_url: string;
    listing_id: string;
    description?: string;
    skills?: string[];
    type?: string;
  };
}

interface SearchFilters {
  query: string;
  location?: string;
  skills?: string[];
  jobType?: string;
}

export const fetchJobsFromQdrant = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/jobs');
    if (!response.ok) throw new Error('Failed to fetch jobs from Qdrant');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching jobs from Qdrant:', error);
    throw error;
  }
};

export const searchJobsWithFilters = async (filters: SearchFilters) => {
  try {
    const response = await fetch('http://localhost:5000/api/search-jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });
    
    if (!response.ok) throw new Error('Failed to search jobs');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching jobs:', error);
    throw error;
  }
};