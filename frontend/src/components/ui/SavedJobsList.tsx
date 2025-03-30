
import React from 'react';
import { Job, useAuthStore, useJobStore } from '@/store/store';
import JobCard from './JobCard';
import { motion } from 'framer-motion';

export default function SavedJobsList() {
  const { user } = useAuthStore();
  const { jobs } = useJobStore();
  
  // Filter jobs to only include those saved by the user
  const savedJobs = jobs.filter(job => user?.savedJobs.includes(job.id));
  
  if (savedJobs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-secondary/30 rounded-xl border border-border p-8 text-center shadow-sm"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        </div>
        <h3 className="text-lg font-medium mb-2">No Saved Jobs Yet</h3>
        <p className="text-muted-foreground mb-6">
          Browse jobs and save the ones you're interested in to view them here.
        </p>
        <a 
          href="/jobs" 
          className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
        >
          Browse Jobs
        </a>
      </motion.div>
    );
  }
  
  return (
    <div className="space-y-4">
      {savedJobs.map(job => (
        <motion.div
          key={job.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <JobCard job={job} />
        </motion.div>
      ))}
    </div>
  );
}
