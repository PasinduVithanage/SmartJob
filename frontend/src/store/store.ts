import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchJobsFromQdrant, searchJobsWithFilters } from '../services/jobService';

// Types
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string; // Full-time, Part-time, Contract, etc.
  description: string;
  requirements: string[];
  postedDate: string;
  logo: string;
  category: string;
  experience: string;
  skills?: string[];
  joburl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  savedJobs: string[];
  appliedJobs: string[];
  cv?: string;
}

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  saveJob: (jobId: string) => void;
  unsaveJob: (jobId: string) => void;
  applyToJob: (jobId: string) => void;
  uploadCV: (file: File) => Promise<void>;
}

interface JobState {
  jobs: Job[];
  filteredJobs: Job[];
  featuredJobs: Job[];
  currentJob: Job | null;
  isLoading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  fetchJobById: (id: string) => Promise<void>;
  filterJobs: (filters: JobFilters) => void;
  searchJobs: (query: string) => void;
}

export interface JobFilters {
  type?: string;
  location?: string;
  salary?: string;
  experience?: string;
  category?: string;
  skills?: string;
}

// Flask API URL (would be provided by environment in a real app)
const API_URL = 'http://localhost:5000/api';

// Theme store
export const useThemeStore = create<ThemeState>()(
  (set) => ({
    isDarkMode: false,
    toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  })
);

// Auth store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        try {
          // This would be an API call to Flask in a real app
          // const response = await fetch(`${API_URL}/auth/login`, {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ email, password }),
          // });
          // if (!response.ok) throw new Error('Login failed');
          // const data = await response.json();
          
          // Mock response for demonstration
          const mockUser: User = {
            id: '1',
            name: 'John Doe',
            email: email,
            isAdmin: email === 'admin@example.com',
            savedJobs: [],
            appliedJobs: [],
          };
          set({ user: mockUser, isAuthenticated: true });
        } catch (error) {
          console.error('Login failed', error);
          throw new Error('Login failed');
        }
      },
      signup: async (name, email, password) => {
        try {
          // This would be an API call to Flask in a real app
          // const response = await fetch(`${API_URL}/auth/signup`, {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ name, email, password }),
          // });
          // if (!response.ok) throw new Error('Signup failed');
          // const data = await response.json();
          
          // Mock response for demonstration
          const mockUser: User = {
            id: '1',
            name: name,
            email: email,
            isAdmin: false,
            savedJobs: [],
            appliedJobs: [],
          };
          set({ user: mockUser, isAuthenticated: true });
        } catch (error) {
          console.error('Signup failed', error);
          throw new Error('Signup failed');
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      saveJob: (jobId) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            savedJobs: [...user.savedJobs, jobId],
          },
        });
      },
      unsaveJob: (jobId) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            savedJobs: user.savedJobs.filter((id) => id !== jobId),
          },
        });
      },
      applyToJob: (jobId) => {
        const { user } = get();
        if (!user) return;
        if (user.appliedJobs.includes(jobId)) return;
        set({
          user: {
            ...user,
            appliedJobs: [...user.appliedJobs, jobId],
          },
        });
      },
      uploadCV: async (file) => {
        const { user } = get();
        if (!user) return;
        
        // This would upload to Flask in a real app
        // const formData = new FormData();
        // formData.append('cv', file);
        // const response = await fetch(`${API_URL}/user/upload-cv`, {
        //   method: 'POST',
        //   body: formData,
        // });
        // if (!response.ok) throw new Error('CV upload failed');
        // const data = await response.json();
        
        // Mock response for demonstration
        const cvUrl = URL.createObjectURL(file);
        set({
          user: {
            ...user,
            cv: cvUrl,
          },
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Job store
export const useJobStore = create<JobState>()((set, get) => ({
  jobs: [],
  filteredJobs: [],
  featuredJobs: [],
  currentJob: null,
  isLoading: false,
  error: null,
  fetchJobs: async () => {
    try {
      set({ isLoading: true });
      
      const data = await fetchJobsFromQdrant();
      
      // Transform Qdrant data to match our Job interface
      const transformedJobs: Job[] = data.map((job: any) => ({
        id: job.id.toString(),
        title: job.payload.title,
        company: job.payload.company,
        location: job.payload.location,
        salary: 'Not disclosed',
        type: 'Full-time',
        description: `Position at ${job.payload.company}`,
        requirements: [],
        postedDate: job.payload.posted_date,
        joburl: job.payload.job_url,
        logo: 'https://placehold.co/100',
        category: 'Not specified',
        experience: 'Not specified',
        skills: [],
      }));
      
      set({ 
        jobs: transformedJobs, 
        filteredJobs: transformedJobs,
        featuredJobs: transformedJobs.slice(0, 4),
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      set({ error: 'Failed to fetch jobs', isLoading: false });
    }
  },
  fetchJobById: async (id) => {
    try {
      set({ isLoading: true });
      
      // This would be an API call to Flask in a real app
      // const response = await fetch(`${API_URL}/jobs/${id}`);
      // if (!response.ok) throw new Error('Failed to fetch job');
      // const job = await response.json();
      
      // Mock implementation
      const { jobs } = get();
      const job = jobs.find((j) => j.id === id);
      
      if (job) {
        set({ currentJob: job, isLoading: false });
      } else {
        throw new Error('Job not found');
      }
    } catch (error) {
      console.error('Failed to fetch job:', error);
      set({ error: 'Failed to fetch job', isLoading: false });
    }
  },
  filterJobs: (filters) => {
    const { jobs } = get();
    let filteredJobs = [...jobs];
    
    if (filters.type && filters.type !== 'all-types') {
      filteredJobs = filteredJobs.filter(job => job.type === filters.type);
    }
    
    if (filters.location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters.experience && filters.experience !== 'all-levels') {
      filteredJobs = filteredJobs.filter(job => job.experience === filters.experience);
    }
    
    if (filters.category && filters.category !== 'all-categories') {
      filteredJobs = filteredJobs.filter(job => job.category === filters.category);
    }
    
    if (filters.salary && filters.salary !== 'any-salary') {
      // Parse salary ranges and filter accordingly
      // This is a simplified implementation
      filteredJobs = filteredJobs.filter(job => job.salary.includes(filters.salary!));
    }
    
    if (filters.skills) {
      const skillList = filters.skills.split(',');
      filteredJobs = filteredJobs.filter(job => 
        job.skills?.some(skill => 
          skillList.some(searchSkill => 
            skill.toLowerCase().includes(searchSkill.toLowerCase())
          )
        )
      );
    }
    
    set({ filteredJobs });
  },
  searchJobs: async (query: string) => {
    try {
      set({ isLoading: true });
      const filters = {
        query,
        location: undefined,
        skills: undefined,
        jobType: undefined,
      };

      const data = await searchJobsWithFilters(filters);
      
      // Transform Qdrant search results
      const transformedJobs: Job[] = data.map((job: any) => ({
        id: job.id.toString(),
        title: job.payload.title,
        company: job.payload.company,
        location: job.payload.location,
        salary: 'Not disclosed',
        type: job.payload.type || 'Full-time',
        description: job.payload.description || `Position at ${job.payload.company}`,
        requirements: [],
        postedDate: job.payload.posted_date,
        joburl: job.payload.job_url,
        logo: 'https://placehold.co/100',
        category: 'Not specified',
        experience: 'Not specified',
        skills: job.payload.skills || [],
      }));

      set({ 
        filteredJobs: transformedJobs,
        isLoading: false 
      });
    } catch (error) {
      console.error('Search failed:', error);
      set({ error: 'Search failed', isLoading: false });
    }
  },
}));
