
import React from 'react';
import { motion } from 'framer-motion';
import { Network, RefreshCcw, UploadCloud } from 'lucide-react';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-secondary/30 rounded-xl border border-border p-6 shadow-sm"
    >
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}

export default function FeatureSection() {
  return (
    <section className="page-container py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-display font-medium mb-4">Why Choose Us</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          SmartJob provides an intuitive platform designed to streamline your job search and connect you with opportunities that match your skills and aspirations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Feature
          icon={<Network className='text-blue-600'/>}
          title="Centralized Job Listings"
          description="Access job postings from multiple platforms like LinkedIn and Topjobs, all in one place—no more switching between websites."
        />
        <Feature
          icon={<RefreshCcw className='text-blue-600'/>}
          title="Accurate & Updated Jobs"
          description="Our platform removes expired listings and ensures job data is refreshed regularly so you only see real, active opportunities."
        />
        <Feature
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 6v6l4 2"></path><circle cx="12" cy="12" r="10"></circle></svg>}
          title="Advanced Job Filtering"
          description="Easily filter job listings by location, salary, industry, job type, and more to quickly find roles that fit your needs."
        />
        <Feature
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 6v6l4 2"></path><circle cx="12" cy="12" r="10"></circle></svg>}
          title="Personalized Job Matches"
          description="Get smart job recommendations tailored to your skills and experience using AI-powered CV analysis."
        />
        <Feature
          icon={<UploadCloud className='text-blue-600'/>}
          title="CV Upload & Profile Matching"
          description="Upload your CV once and let our system find and suggest jobs that match your background and career goals."
        />
        <Feature
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 6v6l4 2"></path><circle cx="12" cy="12" r="10"></circle></svg>}
          title="User-Friendly Interface"
          description="Enjoy a clean, responsive platform with dark/light theme support and simple navigation across all devices."
        />
      </div>
    </section>
  );
}
