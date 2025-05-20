
import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { JobFilters } from '@/store/store';
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface JobFilterProps {
  onFilterChange: (filters: JobFilters) => void;
  className?: string;
}

export default function JobFilter({ onFilterChange, className = '' }: JobFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<JobFilters>({});

  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  // Count active filters
  const activeFiltersCount = Object.keys(filters).filter(key => Boolean(filters[key as keyof JobFilters])).length;

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center space-x-2 w-full mb-4"
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 text-xs rounded-full bg-primary text-white">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-72 bg-white dark:bg-secondary/80 backdrop-blur-lg shadow-lg rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Filter Jobs</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Job Type</label>
              <Select
                value={filters.type || "all-types"}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All Types</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Experience Level</label>
              <Select
                value={filters.experience || "all-levels"}
                onValueChange={(value) => handleFilterChange('experience', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-levels">All Levels</SelectItem>
                  <SelectItem value="Entry-Level">Entry-Level</SelectItem>
                  <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                  <SelectItem value="Executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select
                value={filters.category || "all-categories"}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="DevOps">DevOps</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            {/* <div>
              <label className="text-sm font-medium mb-1 block">Salary Range</label>
              <Select
                value={filters.salary || "any-salary"}
                onValueChange={(value) => handleFilterChange('salary', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any Salary" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any-salary">Any Salary</SelectItem>
                  <SelectItem value="0-50000">$0 - $50,000</SelectItem>
                  <SelectItem value="50000-80000">$50,000 - $80,000</SelectItem>
                  <SelectItem value="80000-100000">$80,000 - $100,000</SelectItem>
                  <SelectItem value="100000-150000">$100,000 - $150,000</SelectItem>
                  <SelectItem value="150000+">$150,000+</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            <div className="pt-4 flex items-center justify-between border-t border-border">
              <Button
                onClick={clearFilters}
                variant="ghost"
                className="text-sm"
              >
                Clear All
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
