
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, DollarSign, Building, Bookmark, BookmarkCheck } from 'lucide-react';
import { Job, useAuthStore } from '@/store/store';
import { motion } from 'framer-motion';

interface JobCardProps {
  job: Job;
  variant?: 'default' | 'compact';
}

export default function JobCard({ job, variant = 'default' }: JobCardProps) {
  const { user, saveJob, unsaveJob } = useAuthStore();
  const isJobSaved = user?.savedJobs.includes(job.id) || false;

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isJobSaved) {
      unsaveJob(job.id);
    } else {
      saveJob(job.id);
    }
  };

  // Calculate days ago
  const getDaysAgo = (dateString: string) => {
    const posted = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysAgo = getDaysAgo(job.postedDate);

  if (variant === 'compact') {
    return (
      <Link to={`/jobs/${job.id}`}>
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-4 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                <img src={job.logo} alt={job.company} className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h3 className="font-medium truncate">{job.title}</h3>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </div>
            </div>
            {user && (
              <button
                onClick={handleSaveToggle}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {isJobSaved ? (
                  <BookmarkCheck className="h-5 w-5 text-primary" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/jobs/${job.id}`}>
      <motion.div 
        whileHover={{ y: -4 }}
        className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-md bg-secondary flex items-center justify-center">
              <img src={job.logo} alt={job.company} className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-medium">{job.title}</h3>
              <p className="text-muted-foreground">{job.company}</p>
            </div>
          </div>
          {user && (
            <button
              onClick={handleSaveToggle}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {isJobSaved ? (
                <BookmarkCheck className="h-6 w-6 text-primary" />
              ) : (
                <Bookmark className="h-6 w-6" />
              )}
            </button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>{job.salary}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Building className="h-4 w-4 mr-2" />
            <span>{job.type}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>{daysAgo} days ago</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 text-xs rounded-full bg-secondary dark:bg-secondary/50 text-secondary-foreground">
              {job.category}
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-secondary dark:bg-secondary/50 text-secondary-foreground">
              {job.experience}
            </span>
          </div>
          <span className="text-sm font-medium text-primary">View Details</span>
        </div>
      </motion.div>
    </Link>
  );
}
