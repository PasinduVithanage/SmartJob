
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { useAuthStore, useJobStore } from '@/store/store';
import SavedJobsList from '@/components/ui/SavedJobsList';
import CVUpload from '@/components/ui/CVUpload';
import { Briefcase, FileText, Heart, Settings, User, LogOut, Mail, Phone, MapPin } from 'lucide-react';
import CVAnalysis from '@/components/ui/CVAnalysis';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { fetchJobs } = useJobStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'saved' | 'applied' | 'cv'>('profile');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?mode=login');
    }
    fetchJobs();
  }, [isAuthenticated, navigate, fetchJobs]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // If not authenticated, don't render the dashboard content
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen pt-32 pb-20">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="col-span-1"
            >
              <div className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border overflow-hidden sticky top-24">
                <div className="p-6 border-b border-border text-center">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-medium text-primary mx-auto mb-3">
                    {user.name.charAt(0)}
                  </div>
                  <h2 className="font-medium text-lg">{user.name}</h2>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('saved')}
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'saved'
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <Heart className="h-5 w-5 mr-3" />
                    Saved Jobs
                    {user.savedJobs.length > 0 && (
                      <span className="ml-auto flex items-center justify-center h-6 min-w-6 rounded-full bg-primary/20 text-primary text-xs">
                        {user.savedJobs.length}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('applied')}
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'applied'
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <Briefcase className="h-5 w-5 mr-3" />
                    Applied Jobs
                    {user.appliedJobs.length > 0 && (
                      <span className="ml-auto flex items-center justify-center h-6 min-w-6 rounded-full bg-primary/20 text-primary text-xs">
                        {user.appliedJobs.length}
                      </span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('cv')}
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'cv'
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <FileText className="h-5 w-5 mr-3" />
                    CV & Documents
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 rounded-lg text-left text-destructive hover:bg-destructive/10 transition-colors mt-4"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <AnimatedTabPanel activeTab={activeTab} />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}

interface AnimatedTabPanelProps {
  activeTab: 'profile' | 'saved' | 'applied' | 'cv';
}

function AnimatedTabPanel({ activeTab }: AnimatedTabPanelProps) {
  const { user } = useAuthStore();
  const { jobs } = useJobStore();
  
  // Filter jobs to only include those applied by the user
  const appliedJobs = jobs.filter(job => user?.appliedJobs.includes(job.id));
  
  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-[50vh]"
    >
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Profile Information</h2>
              <button className="flex items-center text-primary hover:underline">
                <Settings className="h-4 w-4 mr-1" />
                Edit
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p>{user?.name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-muted-foreground">Not provided</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="text-muted-foreground">Not provided</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-xl font-medium mb-6">Activity Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-secondary/50 dark:bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground">Saved Jobs</p>
                  <Heart className="h-5 w-5 text-pink-500" />
                </div>
                <p className="text-2xl font-medium">{user?.savedJobs.length || 0}</p>
              </div>
              
              <div className="bg-secondary/50 dark:bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground">Applied Jobs</p>
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-medium">{user?.appliedJobs.length || 0}</p>
              </div>
              
              <div className="bg-secondary/50 dark:bg-secondary/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-muted-foreground">CV Uploaded</p>
                  <FileText className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-2xl font-medium">{user?.cv ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'saved' && (
        <div>
          <h2 className="text-xl font-medium mb-6">Saved Jobs</h2>
          <SavedJobsList />
        </div>
      )}
      
      {activeTab === 'applied' && (
        <div>
          <h2 className="text-xl font-medium mb-6">Applied Jobs</h2>
          
          {appliedJobs.length === 0 ? (
            <div className="bg-white dark:bg-secondary/30 rounded-xl border border-border p-8 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start applying to jobs to track your applications here.
              </p>
              <a 
                href="/jobs" 
                className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
              >
                Browse Jobs
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {appliedJobs.map(job => (
                <div 
                  key={job.id}
                  className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-md bg-secondary flex items-center justify-center">
                        <img src={job.logo} alt={job.company} className="w-10 h-10 object-contain" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{job.title}</h3>
                        <p className="text-muted-foreground">{job.company}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                      Applied
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        <span>{job.type}</span>
                      </div>
                    </div>
                    <a 
                      href={`/jobs/${job.id}`}
                      className="text-primary hover:underline"
                    >
                      View Job
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* // Replace the CV analysis section with the new component */}
      {activeTab === 'cv' && (
        <div>
          <h2 className="text-xl font-medium mb-6">CV & Documents</h2>
          <CVUpload />
          
          <div className="mt-8 bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-6">
            <h3 className="font-medium mb-4">Job Recommendations</h3>
            <p className="text-muted-foreground mb-6">
              Upload your CV to get personalized job recommendations based on your skills and experience.
            </p>
            <CVAnalysis />
          </div>
        </div>
      )}
    </motion.div>
  );
}
