
import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Facebook, Twitter, Instagram, Linkedin, ChevronRight } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-secondary/50 dark:bg-secondary/20 border-t border-border pt-16 pb-8">
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="text-lg font-display font-medium">JobFinder</span>
            </Link>
            <p className="text-muted-foreground mb-6">
              Find your dream job with our intuitive job search platform. Connect with top employers and advance your career.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-medium mb-4">For Job Seekers</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/jobs" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Career Resources
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  CV Builder
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-medium mb-4">For Employers</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Post a Job
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Browse Candidates
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Recruitment Solutions
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-medium mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="text-muted-foreground">
                1234 Market Street, Suite 1000
              </li>
              <li className="text-muted-foreground">
                San Francisco, CA 94103
              </li>
              <li>
                <a href="mailto:info@jobfinder.com" className="text-muted-foreground hover:text-primary transition-colors">
                  info@jobfinder.com
                </a>
              </li>
              <li>
                <a href="tel:+14155551234" className="text-muted-foreground hover:text-primary transition-colors">
                  +1 (415) 555-1234
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © {year} JobFinder. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
