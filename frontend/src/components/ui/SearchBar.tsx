
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchParams: SearchParams = {
      query,
      location,
      skills,
      jobType
    };
    
    if (onSearch) {
      onSearch(searchParams);
    } else {
      // Navigate to jobs page with search params
      const queryParams = new URLSearchParams();
      if (query) queryParams.append('q', query);
      if (location) queryParams.append('location', location);
      if (skills.length > 0) queryParams.append('skills', skills.join(','));
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between font-normal"
              >
                {skills.length > 0 
                  ? `${skills.length} skill${skills.length > 1 ? 's' : ''} selected` 
                  : 'Select skills'}
                <span className="ml-2 opacity-70">▼</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background border border-border p-2">
              {skillOptions.map((skill) => (
                <div key={skill.value} className="flex items-center space-x-2 p-2 hover:bg-secondary rounded-md cursor-pointer">
                  <Checkbox 
                    id={`skill-${skill.value}`}
                    checked={skills.includes(skill.value)}
                    onCheckedChange={() => toggleSkill(skill.value)}
                  />
                  <label 
                    htmlFor={`skill-${skill.value}`}
                    className="text-sm cursor-pointer flex-1"
                    onClick={() => toggleSkill(skill.value)}
                  >
                    {skill.label}
                  </label>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
