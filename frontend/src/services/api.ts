const API_BASE_URL = 'http://localhost:5000/api';

export const fetchJobs = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/jobs`);
        if (!response.ok) {
            throw new Error('Failed to fetch jobs');
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching jobs:', error);
        throw error;
    }
};

export const searchJobs = async (searchParams: any) => {
    try {
        const response = await fetch(`${API_BASE_URL}/search-jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchParams),
        });
        if (!response.ok) {
            throw new Error('Failed to search jobs');
        }
        return await response.json();
    } catch (error) {
        console.error('Error searching jobs:', error);
        throw error;
    }
};