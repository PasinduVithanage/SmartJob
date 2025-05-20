
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useJobStore } from '@/store/store';

interface SearchBarProps {
  className?: string;
  onSearch?: (params: SearchParams) => void;
  variant?: 'default' | 'minimal';
}

export interface SearchParams {
  query: string;
  location: string;
  skills: string[];
  jobType: string;
}

export default function SearchBar({ className = '', onSearch, variant = 'default' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [jobType, setJobType] = useState('');
  const navigate = useNavigate();
  const { searchJobs, filterJobs } = useJobStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // First, apply the search query
    if (query) {
      searchJobs(query);
    }
    
    // Then apply any filters
    const filters: any = {};
    if (location) filters.location = location;
    if (jobType) filters.type = jobType;
    
    if (Object.keys(filters).length > 0) {
      filterJobs(filters);
    }
    
    if (onSearch) {
      onSearch({
        query,
        location,
        skills,
        jobType
      });
    } else {
      // Navigate to jobs page with search params
      const queryParams = new URLSearchParams();
      if (query) queryParams.append('q', query);
      if (location) queryParams.append('location', location);
      if (jobType) queryParams.append('jobType', jobType);
      
      navigate(`/jobs?${queryParams.toString()}`);
    }
  };

  const skillOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'react', label: 'React' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'flutter', label: 'Flutter' },
    { value: 'django', label: 'Django' },
    { value: 'flask', label: 'Flask' },
  ];

  const toggleSkill = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill) 
        : [...prev, skill]
    );
  };

  if (variant === 'minimal') {
    return (
      <form onSubmit={handleSearch} className={`relative w-full ${className}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for jobs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-full"
        />
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSearch}
      className={`bg-white dark:bg-secondary/50 rounded-2xl shadow-sm border border-border backdrop-blur-sm ${className}`}
    >
      <div className="flex flex-col md:flex-row gap-3 p-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Job title, keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex-1">
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="freelance">Freelance</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Search Jobs
        </Button>
      </div>
    </form>
  );
}
