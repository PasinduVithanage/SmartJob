
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SearchBar, { SearchParams } from '@/components/ui/SearchBar';
import JobCard from '@/components/ui/JobCard';
import JobFilter from '@/components/ui/JobFilter';
import { useJobStore, JobFilters } from '@/store/store';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

export default function Jobs() {
  const location = useLocation();
  const { fetchJobs, filteredJobs, filterJobs, searchJobs, isLoading } = useJobStore();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    location: '',
    skills: [],
    jobType: '',
  });

  // Get search params from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    const loc = params.get('location');
    const skillsParam = params.get('skills');
    const skills = skillsParam ? skillsParam.split(',') : [];
    const jobType = params.get('jobType');
    const category = params.get('category');
    
    // Set local state
    const newSearchParams = { ...searchParams };
    if (q) newSearchParams.query = q;
    if (loc) newSearchParams.location = loc;
    if (skills.length > 0) newSearchParams.skills = skills;
    if (jobType) newSearchParams.jobType = jobType;
    setSearchParams(newSearchParams);
    
    // Fetch jobs first
    fetchJobs().then(() => {
      // Apply filters from URL params
      const initialFilters: JobFilters = {};
      if (category) initialFilters.category = category;
      if (loc) initialFilters.location = loc;
      if (jobType) initialFilters.type = jobType;
      if (skills.length > 0) initialFilters.skills = skills.join(',');
      
      if (Object.keys(initialFilters).length > 0) {
        filterJobs(initialFilters);
      }
      
      // Apply search query
      if (q) {
        searchJobs(q);
      }
    });
  }, [location.search, fetchJobs, filterJobs, searchJobs]);

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    
    // Apply filters
    const filters: JobFilters = {};
    if (params.location) filters.location = params.location;
    if (params.jobType) filters.type = params.jobType;
    if (params.skills.length > 0) filters.skills = params.skills.join(',');
    
    if (Object.keys(filters).length > 0) {
      filterJobs(filters);
    }
    
    // Apply search query
    if (params.query) {
      searchJobs(params.query);
    }
  };

  const handleFilterChange = (filters: JobFilters) => {
    filterJobs(filters);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-6 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-md bg-secondary"></div>
              <div>
                <div className="h-5 w-48 bg-secondary rounded mb-2"></div>
                <div className="h-4 w-32 bg-secondary rounded"></div>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-secondary"></div>
          </div>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(j => (
              <div key={j} className="h-4 bg-secondary rounded"></div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-secondary rounded-full"></div>
              <div className="h-6 w-20 bg-secondary rounded-full"></div>
            </div>
            <div className="h-4 w-24 bg-secondary rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 pb-12 bg-secondary/50 dark:bg-secondary/20">
        <div className="page-container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-display font-medium mb-2">Find Your Perfect Job</h1>
              <p className="text-muted-foreground">
                Browse our extensive list of job opportunities across various industries
              </p>
            </div>
            
            <SearchBar
              onSearch={handleSearch}
              className="mb-4"
            />
          </div>
        </div>
      </section>
      
      {/* Job Listings */}
      <section className="py-12">
        <div className="page-container">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar / Filters */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="sticky top-24">
                <JobFilter onFilterChange={handleFilterChange} className="mb-6" />
                
                {/* Job counts */}
                <div className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-4">
                  <h3 className="font-medium mb-4">Job Details</h3>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Available Jobs</p>
                      <p className="font-medium">{filteredJobs.length}</p>
                    </div>
                  </div>
                  
                  {searchParams.query && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Searching for: </span>
                      <span className="font-medium">{searchParams.query}</span>
                    </div>
                  )}
                  
                  {searchParams.location && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Location: </span>
                      <span className="font-medium">{searchParams.location}</span>
                    </div>
                  )}
                  
                  {searchParams.skills.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Skills: </span>
                      <span className="font-medium">{searchParams.skills.join(', ')}</span>
                    </div>
                  )}
                  
                  {searchParams.jobType && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Job Type: </span>
                      <span className="font-medium">{searchParams.jobType}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Job List */}
            <div className="flex-1">
              {isLoading ? (
                <LoadingSkeleton />
              ) : filteredJobs.length > 0 ? (
                <div className="space-y-6">
                  {filteredJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <JobCard job={job} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-8 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search filters or exploring different keywords.
                  </p>
                  <button
                    onClick={() => {
                      setSearchParams({
                        query: '',
                        location: '',
                        skills: [], // Fixed: Changed from string to array
                        jobType: '',
                      });
                      filterJobs({});
                      fetchJobs();
                    }}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
}
