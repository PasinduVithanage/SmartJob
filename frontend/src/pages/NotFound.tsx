
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen pt-32 pb-20">
        <div className="page-container">
          <div className="max-w-lg mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-primary/10 dark:bg-primary/5 rounded-full animate-pulse"></div>
                <span className="absolute inset-0 flex items-center justify-center text-5xl font-display font-bold text-primary">
                  404
                </span>
              </div>
              
              <h1 className="text-3xl font-display font-medium mb-4">Page Not Found</h1>
              <p className="text-muted-foreground mb-8">
                The page you are looking for doesn't exist or has been moved. Please check the URL or try navigating back to the home page.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to="/" 
                  className="flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>
                <Link 
                  to="/jobs" 
                  className="flex items-center px-6 py-2 border border-input rounded-full hover:bg-accent transition-colors"
                >
                  Browse Jobs
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default NotFound;
