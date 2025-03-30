import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      
      // This would be an API call to Flask in a real app
      // const response = await fetch(`${API_URL}/jobs`);
      // if (!response.ok) throw new Error('Failed to fetch jobs');
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Senior Frontend Developer',
          company: 'TechCorp',
          location: 'San Francisco, CA',
          salary: '$120,000 - $150,000',
          type: 'Full-time',
          description: 'We are looking for a skilled frontend developer to join our team...',
          requirements: ['5+ years of React experience', 'TypeScript knowledge', 'UI/UX skills'],
          postedDate: '2023-05-15',
          logo: 'https://placehold.co/100',
          category: 'Development',
          experience: 'Senior',
          skills: ['React', 'TypeScript', 'CSS'],
        },
        {
          id: '2',
          title: 'UX Designer',
          company: 'DesignStudio',
          location: 'Remote',
          salary: '$90,000 - $110,000',
          type: 'Full-time',
          description: 'Join our design team to create beautiful user experiences...',
          requirements: ['3+ years of UX design', 'Figma proficiency', 'User research'],
          postedDate: '2023-05-10',
          logo: 'https://placehold.co/100',
          category: 'Design',
          experience: 'Mid-Level',
          skills: ['Figma', 'Adobe XD', 'User Testing'],
        },
        {
          id: '3',
          title: 'Data Scientist',
          company: 'DataWorks',
          location: 'New York, NY',
          salary: '$130,000 - $160,000',
          type: 'Full-time',
          description: 'Help us analyze complex data and create insights...',
          requirements: ['Python', 'Machine Learning', 'Statistics', 'Data Visualization'],
          postedDate: '2023-05-12',
          logo: 'https://placehold.co/100',
          category: 'Data Science',
          experience: 'Senior',
          skills: ['Python', 'TensorFlow', 'SQL'],
        },
        {
          id: '4',
          title: 'DevOps Engineer',
          company: 'CloudScale',
          location: 'Remote',
          salary: '$110,000 - $140,000',
          type: 'Full-time',
          description: 'Help us build and maintain our cloud infrastructure...',
          requirements: ['AWS', 'Kubernetes', 'CI/CD', 'Linux'],
          postedDate: '2023-05-14',
          logo: 'https://placehold.co/100',
          category: 'DevOps',
          experience: 'Mid-Level',
          skills: ['AWS', 'Docker', 'Kubernetes'],
        },
        {
          id: '5',
          title: 'Product Manager',
          company: 'ProductLabs',
          location: 'Austin, TX',
          salary: '$100,000 - $130,000',
          type: 'Full-time',
          description: 'Lead product development and strategy...',
          requirements: ['3+ years in product management', 'Agile methodologies', 'Technical background'],
          postedDate: '2023-05-08',
          logo: 'https://placehold.co/100',
          category: 'Management',
          experience: 'Mid-Level',
          skills: ['Agile', 'JIRA', 'User Stories'],
        },
        {
          id: '6',
          title: 'Mobile Developer',
          company: 'AppFactory',
          location: 'Seattle, WA',
          salary: '$90,000 - $120,000',
          type: 'Full-time',
          description: 'Build native mobile applications for iOS and Android...',
          requirements: ['React Native', 'Swift', 'Kotlin', 'Mobile UI design'],
          postedDate: '2023-05-11',
          logo: 'https://placehold.co/100',
          category: 'Development',
          experience: 'Mid-Level',
          skills: ['React Native', 'Swift', 'Kotlin'],
        },
        {
          id: '7',
          title: 'Content Writer',
          company: 'ContentCraft',
          location: 'Remote',
          salary: '$60,000 - $80,000',
          type: 'Part-time',
          description: 'Create engaging content for our blogs and social media...',
          requirements: ['Strong writing skills', 'SEO knowledge', 'Content strategy'],
          postedDate: '2023-05-16',
          logo: 'https://placehold.co/100',
          category: 'Marketing',
          experience: 'Entry-Level',
          skills: ['SEO', 'Content Writing', 'WordPress'],
        },
        {
          id: '8',
          title: 'Backend Engineer',
          company: 'ServerStack',
          location: 'Chicago, IL',
          salary: '$100,000 - $130,000',
          type: 'Full-time',
          description: 'Design and build our backend services and APIs...',
          requirements: ['Node.js', 'Python', 'Database design', 'API development'],
          postedDate: '2023-05-09',
          logo: 'https://placehold.co/100',
          category: 'Development',
          experience: 'Mid-Level',
          skills: ['Node.js', 'Python', 'MongoDB'],
        },
      ];
      
      set({ 
        jobs: mockJobs, 
        filteredJobs: mockJobs,
        featuredJobs: mockJobs.slice(0, 4),
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
  searchJobs: (query) => {
    const { jobs } = get();
    if (!query.trim()) {
      set({ filteredJobs: jobs });
      return;
    }
    
    const searchResults = jobs.filter(job => 
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.company.toLowerCase().includes(query.toLowerCase()) ||
      job.description.toLowerCase().includes(query.toLowerCase()) ||
      job.skills?.some(skill => skill.toLowerCase().includes(query.toLowerCase()))
    );
    
    set({ filteredJobs: searchResults });
  }
}));
