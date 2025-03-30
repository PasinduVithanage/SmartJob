
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useJobStore, useAuthStore } from '@/store/store';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  DollarSign, 
  Building, 
  Clock, 
  Calendar, 
  Briefcase, 
  Bookmark, 
  BookmarkCheck, 
  ArrowLeft, 
  Share2,
  Send
} from 'lucide-react';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchJobById, currentJob, isLoading } = useJobStore();
  const { user, saveJob, unsaveJob, applyToJob } = useAuthStore();
  const [isApplying, setIsApplying] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobById(id);
    }
  }, [id, fetchJobById]);

  const isJobSaved = user?.savedJobs.includes(id || '') || false;
  const hasApplied = user?.appliedJobs.includes(id || '') || false;

  const handleSaveToggle = () => {
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }
    
    if (isJobSaved) {
      unsaveJob(id || '');
    } else {
      saveJob(id || '');
    }
  };

  const handleApply = () => {
    if (!user) {
      navigate('/auth?mode=login');
      return;
    }
    
    setIsApplying(true);
    
    // Simulate API call
    setTimeout(() => {
      applyToJob(id || '');
      setIsApplying(false);
    }, 1500);
  };

  const handleShare = () => {
    setShowShareOptions(!showShareOptions);
  };

  const shareVia = (platform: string) => {
    const url = window.location.href;
    const title = currentJob?.title || 'Job Posting';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this job: ${url}`)}`;
        break;
    }
    
    window.open(shareUrl, '_blank');
    setShowShareOptions(false);
  };

  // Calculate days ago
  const getDaysAgo = (dateString: string) => {
    const posted = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="pt-32 pb-20">
          <div className="page-container">
            <div className="max-w-3xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 w-3/4 bg-secondary rounded mb-4"></div>
                <div className="h-6 w-1/2 bg-secondary rounded mb-8"></div>
                
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 rounded-md bg-secondary"></div>
                  <div>
                    <div className="h-6 w-40 bg-secondary rounded mb-2"></div>
                    <div className="h-4 w-32 bg-secondary rounded"></div>
                  </div>
                </div>
                
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-4 w-full bg-secondary rounded mb-3"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!currentJob) {
    return (
      <>
        <Navbar />
        <div className="pt-32 pb-20">
          <div className="page-container">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-medium mb-4">Job Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The job you're looking for doesn't exist or has been removed.
              </p>
              <Link 
                to="/jobs" 
                className="inline-flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Jobs
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const daysAgo = getDaysAgo(currentJob.postedDate);

  return (
    <>
      <Navbar />
      
      <div className="pt-32 pb-20">
        <div className="page-container">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <div className="mb-6">
              <Link 
                to="/jobs" 
                className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Jobs
              </Link>
            </div>
            
            {/* Job header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-6 mb-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-md bg-secondary flex items-center justify-center">
                    <img src={currentJob.logo} alt={currentJob.company} className="w-12 h-12 object-contain" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-display font-medium">{currentJob.title}</h1>
                    <p className="text-muted-foreground">{currentJob.company}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveToggle}
                    className={`flex items-center px-4 py-2 rounded-full transition-colors ${
                      isJobSaved
                        ? 'bg-primary/10 text-primary'
                        : 'border border-input hover:bg-accent'
                    }`}
                  >
                    {isJobSaved ? (
                      <>
                        <BookmarkCheck className="mr-2 h-5 w-5" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="mr-2 h-5 w-5" />
                        Save
                      </>
                    )}
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={handleShare}
                      className="flex items-center px-4 py-2 border border-input rounded-full hover:bg-accent transition-colors"
                    >
                      <Share2 className="mr-2 h-5 w-5" />
                      Share
                    </button>
                    
                    {showShareOptions && (
                      <div className="absolute z-10 right-0 mt-2 w-48 bg-white dark:bg-secondary/80 backdrop-blur-lg shadow-lg rounded-xl border border-border p-2">
                        <button
                          onClick={() => shareVia('linkedin')}
                          className="flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          LinkedIn
                        </button>
                        <button
                          onClick={() => shareVia('twitter')}
                          className="flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          Twitter
                        </button>
                        <button
                          onClick={() => shareVia('facebook')}
                          className="flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-2"><path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z"/></svg>
                          Facebook
                        </button>
                        <button
                          onClick={() => shareVia('email')}
                          className="flex items-center w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Email
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center text-sm">
                  <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>{currentJob.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>{currentJob.salary}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>{currentJob.type}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Posted {daysAgo} days ago</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 text-sm rounded-full bg-secondary dark:bg-secondary/50 text-secondary-foreground">
                  {currentJob.category}
                </span>
                <span className="px-3 py-1 text-sm rounded-full bg-secondary dark:bg-secondary/50 text-secondary-foreground">
                  {currentJob.experience}
                </span>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={handleApply}
                  disabled={hasApplied || isApplying}
                  className={`w-full sm:w-auto px-8 py-3 rounded-full font-medium transition-all ${
                    hasApplied 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 cursor-default'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {isApplying ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Applying...
                    </span>
                  ) : hasApplied ? (
                    <span className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      Applied
                    </span>
                  ) : (
                    'Apply Now'
                  )}
                </button>
              </div>
            </motion.div>
            
            {/* Job details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="md:col-span-2 space-y-8"
              >
                <div className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-6">
                  <h2 className="text-xl font-medium mb-4">Job Description</h2>
                  <p className="text-muted-foreground mb-6">
                    {currentJob.description}
                  </p>
                  
                  <h3 className="text-lg font-medium mb-3">Requirements</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
                    {currentJob.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                  
                  <h3 className="text-lg font-medium mb-3">What We Offer</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Competitive salary and benefits package</li>
                    <li>Flexible working hours and remote work options</li>
                    <li>Professional development opportunities</li>
                    <li>Collaborative and innovative work environment</li>
                    <li>Health insurance and retirement plans</li>
                  </ul>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-6">
                  <h2 className="text-xl font-medium mb-4">Company Overview</h2>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center mr-3">
                      <img src={currentJob.logo} alt={currentJob.company} className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <h3 className="font-medium">{currentJob.company}</h3>
                      <p className="text-sm text-muted-foreground">Technology</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    A leading technology company focused on innovation and user experience. With a global presence and a commitment to excellence, we're revolutionizing how people interact with technology.
                  </p>
                  <a 
                    href="#" 
                    className="text-primary hover:underline transition-colors"
                  >
                    Visit Website
                  </a>
                </div>
                
                <div className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-6">
                  <h2 className="text-xl font-medium mb-4">Job Details</h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Posted Date</p>
                        <p>{currentJob.postedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Employment Type</p>
                        <p>{currentJob.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p>{currentJob.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Salary Range</p>
                        <p>{currentJob.salary}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary/10 dark:bg-primary/5 rounded-xl shadow-sm border border-border p-6">
                  <h2 className="text-xl font-medium mb-4">Ready to Apply?</h2>
                  <p className="text-muted-foreground mb-4">
                    Take the next step in your career journey with {currentJob.company}.
                  </p>
                  <button
                    onClick={handleApply}
                    disabled={hasApplied || isApplying}
                    className={`w-full py-3 rounded-full font-medium transition-all ${
                      hasApplied 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 cursor-default'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {hasApplied ? 'Already Applied' : 'Apply Now'}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
