
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Code, PenTool, BarChart, Database, Layout, FileText } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SearchBar from '@/components/ui/SearchBar';
import CategoryCard from '@/components/ui/CategoryCard';
import JobCard from '@/components/ui/JobCard';
import FeatureSection from '@/components/ui/FeatureSection';
import { useJobStore } from '@/store/store';

export default function Index() {
  const { fetchJobs, featuredJobs } = useJobStore();

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const categories = [
    { title: 'Development', icon: <Code className="h-6 w-6 text-white" />, count: 352, color: 'bg-blue-500' },
    { title: 'Design', icon: <PenTool className="h-6 w-6 text-white" />, count: 218, color: 'bg-purple-500' },
    { title: 'Marketing', icon: <BarChart className="h-6 w-6 text-white" />, count: 186, color: 'bg-orange-500' },
    { title: 'Data Science', icon: <Database className="h-6 w-6 text-white" />, count: 142, color: 'bg-green-500' },
    { title: 'UI/UX', icon: <Layout className="h-6 w-6 text-white" />, count: 156, color: 'bg-pink-500' },
    { title: 'Content', icon: <FileText className="h-6 w-6 text-white" />, count: 104, color: 'bg-yellow-500' },
  ];

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
                <stop offset="100%" stopColor="rgba(16, 185, 129, 0.1)" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#bg-gradient)" />
          </svg>
          <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/4 w-[40rem] h-[40rem] rounded-full bg-primary/30 dark:bg-primary/10 blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 -translate-x-1/3 translate-y-1/4 w-[30rem] h-[30rem] rounded-full bg-blue-400/20 dark:bg-blue-400/10 blur-3xl opacity-30"></div>
        </div>
        
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold mb-6 tracking-tight text-balance">
                Find Your Dream Job <br className="hidden md:block" />
                <span className="text-primary">With AI-Powered Matching</span>
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-muted-foreground mb-8"
            >
              Connect with top employers and find opportunities that match your skills and aspirations.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <SearchBar className="max-w-3xl mx-auto" />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link 
                to="/jobs" 
                className="flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
              >
                <Briefcase className="mr-2 h-5 w-5" />
                Explore Jobs
              </Link>
              <Link 
                to="/auth?mode=signup" 
                className="flex items-center px-6 py-3 border border-input rounded-full hover:bg-accent transition-colors"
              >
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-20 bg-secondary/50 dark:bg-secondary/20">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-medium mb-4">Popular Job Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore job opportunities across various in-demand categories and find the perfect match for your skills.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CategoryCard
                  title={category.title}
                  icon={category.icon}
                  jobCount={category.count}
                  color={category.color}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Jobs Section */}
      <section className="py-20">
        <div className="page-container">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-display font-medium mb-2">Featured Jobs</h2>
              <p className="text-muted-foreground">
                Explore our handpicked selection of top opportunities
              </p>
            </div>
            <Link 
              to="/jobs" 
              className="hidden md:flex items-center text-primary hover:underline"
            >
              View All Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {featuredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </div>
          
          <div className="text-center md:hidden">
            <Link 
              to="/jobs" 
              className="inline-flex items-center text-primary hover:underline"
            >
              View All Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Feature Section */}
      <FeatureSection />
      
      {/* CTA Section */}
      <section className="py-20 bg-primary/10 dark:bg-primary/5">
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-display font-medium mb-4">Ready to Find Your Next Opportunity?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Upload your CV and let our AI-powered system match you with the perfect job.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to="/auth?mode=signup" 
                  className="flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Upload Your CV
                </Link>
                <Link 
                  to="/jobs" 
                  className="flex items-center px-6 py-3 border border-input rounded-full hover:bg-accent transition-colors"
                >
                  Browse All Jobs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
}
