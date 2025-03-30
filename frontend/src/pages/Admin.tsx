
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { useAuthStore, useJobStore, Job } from '@/store/store';
import { 
  Briefcase, 
  Users, 
  BarChart, 
  Settings, 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  X
} from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { jobs, fetchJobs } = useJobStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'jobs' | 'users' | 'settings'>('dashboard');
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Job | '';
    direction: 'ascending' | 'descending';
  }>({ key: '', direction: 'ascending' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?mode=login');
    } else if (!user?.isAdmin) {
      navigate('/dashboard');
    }
    fetchJobs();
  }, [isAuthenticated, user, navigate, fetchJobs]);

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort jobs
  const sortedJobs = [...filteredJobs];
  if (sortConfig.key !== '') {
    sortedJobs.sort((a, b) => {
      const keyA = a[sortConfig.key as keyof Job];
      const keyB = b[sortConfig.key as keyof Job];
      
      if (keyA < keyB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (keyA > keyB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  const requestSort = (key: keyof Job) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // If not authenticated or not admin, don't render the admin content
  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen pt-32 pb-20">
        <div className="page-container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-64 flex-shrink-0"
            >
              <div className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border overflow-hidden sticky top-24">
                <div className="p-6 border-b border-border">
                  <h2 className="font-medium text-lg">Admin Panel</h2>
                  <p className="text-muted-foreground text-sm">Manage your platform</p>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'dashboard'
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <BarChart className="h-5 w-5 mr-3" />
                    Dashboard
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'jobs'
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <Briefcase className="h-5 w-5 mr-3" />
                    Jobs
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'users'
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <Users className="h-5 w-5 mr-3" />
                    Users
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === 'settings'
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </button>
                </div>
              </div>
            </motion.div>
            
            {/* Main Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              {activeTab === 'dashboard' && (
                <div>
                  <h2 className="text-2xl font-medium mb-6">Dashboard Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-muted-foreground">Total Jobs</h3>
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-3xl font-medium">{jobs.length}</p>
                      <div className="mt-2 text-sm text-green-600">
                        <span className="flex items-center">
                          <ChevronUp className="h-4 w-4 mr-1" />
                          5% from last month
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-muted-foreground">Total Users</h3>
                        <Users className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-3xl font-medium">254</p>
                      <div className="mt-2 text-sm text-green-600">
                        <span className="flex items-center">
                          <ChevronUp className="h-4 w-4 mr-1" />
                          12% from last month
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-muted-foreground">Job Applications</h3>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      </div>
                      <p className="text-3xl font-medium">186</p>
                      <div className="mt-2 text-sm text-green-600">
                        <span className="flex items-center">
                          <ChevronUp className="h-4 w-4 mr-1" />
                          8% from last month
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-6 mb-8">
                    <h3 className="font-medium mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm">New job posting: <span className="font-medium">Senior Frontend Developer</span></p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm">New user registered: <span className="font-medium">Jane Smith</span></p>
                          <p className="text-xs text-muted-foreground">5 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm">15 new applications received</p>
                          <p className="text-xs text-muted-foreground">12 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <X className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm">Job posting expired: <span className="font-medium">Marketing Manager</span></p>
                          <p className="text-xs text-muted-foreground">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'jobs' && (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h2 className="text-2xl font-medium mb-4 sm:mb-0">Manage Jobs</h2>
                    <button
                      onClick={() => setIsAddingJob(true)}
                      className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <PlusCircle className="h-5 w-5 mr-2" />
                      Add New Job
                    </button>
                  </div>
                  
                  <div className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search jobs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-secondary/50 dark:bg-secondary/30 text-left">
                          <tr>
                            <th className="px-6 py-3 font-medium whitespace-nowrap">
                              <button 
                                onClick={() => requestSort('title')}
                                className="flex items-center"
                              >
                                Title
                                {sortConfig.key === 'title' && (
                                  sortConfig.direction === 'ascending' 
                                    ? <ChevronUp className="h-4 w-4 ml-1" />
                                    : <ChevronDown className="h-4 w-4 ml-1" />
                                )}
                              </button>
                            </th>
                            <th className="px-6 py-3 font-medium whitespace-nowrap">
                              <button 
                                onClick={() => requestSort('company')}
                                className="flex items-center"
                              >
                                Company
                                {sortConfig.key === 'company' && (
                                  sortConfig.direction === 'ascending' 
                                    ? <ChevronUp className="h-4 w-4 ml-1" />
                                    : <ChevronDown className="h-4 w-4 ml-1" />
                                )}
                              </button>
                            </th>
                            <th className="px-6 py-3 font-medium whitespace-nowrap">Location</th>
                            <th className="px-6 py-3 font-medium whitespace-nowrap">Type</th>
                            <th className="px-6 py-3 font-medium whitespace-nowrap">
                              <button 
                                onClick={() => requestSort('postedDate')}
                                className="flex items-center"
                              >
                                Date Posted
                                {sortConfig.key === 'postedDate' && (
                                  sortConfig.direction === 'ascending' 
                                    ? <ChevronUp className="h-4 w-4 ml-1" />
                                    : <ChevronDown className="h-4 w-4 ml-1" />
                                )}
                              </button>
                            </th>
                            <th className="px-6 py-3 font-medium whitespace-nowrap text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedJobs.map(job => (
                            <tr key={job.id} className="border-t border-border">
                              <td className="px-6 py-4 whitespace-nowrap">{job.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{job.company}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{job.location}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs rounded-full bg-secondary dark:bg-secondary/50 text-secondary-foreground">
                                  {job.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">{job.postedDate}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    className="p-1 text-muted-foreground hover:text-primary"
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    className="p-1 text-muted-foreground hover:text-destructive"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          
                          {sortedJobs.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                No jobs found. Try adjusting your search.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'users' && (
                <div>
                  <h2 className="text-2xl font-medium mb-6">Manage Users</h2>
                  
                  <div className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          className="w-full pl-9 pr-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-secondary/50 dark:bg-secondary/30 text-left">
                          <tr>
                            <th className="px-6 py-3 font-medium whitespace-nowrap">Name</th>
                            <th className="px-6 py-3 font-medium whitespace-nowrap">Email</th>
                            <th className="px-6 py-3 font-medium whitespace-nowrap">Role</th>
                            <th className="px-6 py-3 font-medium whitespace-nowrap">Saved Jobs</th>
                            <th className="px-6 py-3 font-medium whitespace-nowrap">Applications</th>
                            <th className="px-6 py-3 font-medium whitespace-nowrap text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-border">
                            <td className="px-6 py-4 whitespace-nowrap">John Doe</td>
                            <td className="px-6 py-4 whitespace-nowrap">john@example.com</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                Admin
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">5</td>
                            <td className="px-6 py-4 whitespace-nowrap">3</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end space-x-2">
                                <button
                                  className="p-1 text-muted-foreground hover:text-primary"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  className="p-1 text-muted-foreground hover:text-destructive"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-t border-border">
                            <td className="px-6 py-4 whitespace-nowrap">Jane Smith</td>
                            <td className="px-6 py-4 whitespace-nowrap">jane@example.com</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs rounded-full bg-secondary dark:bg-secondary/50 text-secondary-foreground">
                                User
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">2</td>
                            <td className="px-6 py-4 whitespace-nowrap">1</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end space-x-2">
                                <button
                                  className="p-1 text-muted-foreground hover:text-primary"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  className="p-1 text-muted-foreground hover:text-destructive"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          <tr className="border-t border-border">
                            <td className="px-6 py-4 whitespace-nowrap">Robert Johnson</td>
                            <td className="px-6 py-4 whitespace-nowrap">robert@example.com</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs rounded-full bg-secondary dark:bg-secondary/50 text-secondary-foreground">
                                User
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">7</td>
                            <td className="px-6 py-4 whitespace-nowrap">4</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end space-x-2">
                                <button
                                  className="p-1 text-muted-foreground hover:text-primary"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  className="p-1 text-muted-foreground hover:text-destructive"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="p-4 border-t border-border flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">Showing 1-3 of 254 users</p>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 border border-input rounded hover:bg-accent transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-primary-foreground">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent transition-colors">2</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-accent transition-colors">3</button>
                        <button className="p-1 border border-input rounded hover:bg-accent transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-medium mb-6">Platform Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-6">
                      <h3 className="font-medium mb-6">General Settings</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="platform-name" className="block text-sm font-medium mb-1">
                            Platform Name
                          </label>
                          <input
                            id="platform-name"
                            type="text"
                            defaultValue="JobFinder"
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="platform-url" className="block text-sm font-medium mb-1">
                            Platform URL
                          </label>
                          <input
                            id="platform-url"
                            type="text"
                            defaultValue="https://jobfinder.com"
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">
                              Allow Public Registration
                            </label>
                            <p className="text-xs text-muted-foreground">
                              Allow users to create accounts without invitation
                            </p>
                          </div>
                          <div className="relative inline-block w-12 h-6 rounded-full bg-secondary">
                            <input 
                              type="checkbox" 
                              id="toggle-registration" 
                              className="sr-only" 
                              defaultChecked 
                            />
                            <label 
                              htmlFor="toggle-registration" 
                              className="block absolute left-1 top-1 bottom-1 w-4 h-4 rounded-full bg-white cursor-pointer peer-checked:left-7"
                            ></label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-6">
                      <h3 className="font-medium mb-6">Email Settings</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="email-from" className="block text-sm font-medium mb-1">
                            From Email
                          </label>
                          <input
                            id="email-from"
                            type="email"
                            defaultValue="noreply@jobfinder.com"
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">
                              Send Welcome Email
                            </label>
                            <p className="text-xs text-muted-foreground">
                              Send an email when users register
                            </p>
                          </div>
                          <div className="relative inline-block w-12 h-6 rounded-full bg-secondary">
                            <input 
                              type="checkbox" 
                              id="toggle-welcome" 
                              className="sr-only" 
                              defaultChecked 
                            />
                            <label 
                              htmlFor="toggle-welcome" 
                              className="block absolute left-1 top-1 bottom-1 w-4 h-4 rounded-full bg-white cursor-pointer peer-checked:left-7"
                            ></label>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">
                              Job Application Notifications
                            </label>
                            <p className="text-xs text-muted-foreground">
                              Send notifications for new job applications
                            </p>
                          </div>
                          <div className="relative inline-block w-12 h-6 rounded-full bg-secondary">
                            <input 
                              type="checkbox" 
                              id="toggle-application" 
                              className="sr-only" 
                              defaultChecked 
                            />
                            <label 
                              htmlFor="toggle-application" 
                              className="block absolute left-1 top-1 bottom-1 w-4 h-4 rounded-full bg-white cursor-pointer peer-checked:left-7"
                            ></label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button className="px-4 py-2 border border-input rounded-lg hover:bg-accent transition-colors">
                        Cancel
                      </button>
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Add Job Modal */}
      {isAddingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-secondary w-full max-w-2xl rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <h3 className="text-xl font-medium">Add New Job</h3>
            </div>
            
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label htmlFor="job-title" className="block text-sm font-medium mb-1">
                    Job Title *
                  </label>
                  <input
                    id="job-title"
                    type="text"
                    placeholder="e.g. Senior Frontend Developer"
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium mb-1">
                    Company *
                  </label>
                  <input
                    id="company"
                    type="text"
                    placeholder="e.g. TechCorp"
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium mb-1">
                      Location *
                    </label>
                    <input
                      id="location"
                      type="text"
                      placeholder="e.g. San Francisco, CA"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium mb-1">
                      Job Type *
                    </label>
                    <select
                      id="type"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select category</option>
                      <option value="Development">Development</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Management">Management</option>
                      <option value="Data Science">Data Science</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium mb-1">
                      Experience Level *
                    </label>
                    <select
                      id="experience"
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select level</option>
                      <option value="Entry-Level">Entry-Level</option>
                      <option value="Mid-Level">Mid-Level</option>
                      <option value="Senior">Senior</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="salary" className="block text-sm font-medium mb-1">
                    Salary Range *
                  </label>
                  <input
                    id="salary"
                    type="text"
                    placeholder="e.g. $100,000 - $130,000"
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Job Description *
                  </label>
                  <textarea
                    id="description"
                    rows={5}
                    placeholder="Describe the job responsibilities and requirements..."
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium mb-1">
                    Requirements (one per line) *
                  </label>
                  <textarea
                    id="requirements"
                    rows={4}
                    placeholder="5+ years of React experience&#10;TypeScript knowledge&#10;UI/UX skills"
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="logo" className="block text-sm font-medium mb-1">
                    Company Logo
                  </label>
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-border flex justify-end space-x-3">
              <button
                onClick={() => setIsAddingJob(false)}
                className="px-4 py-2 border border-input rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Job
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      <Footer />
    </>
  );
}
