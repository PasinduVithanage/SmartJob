
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  jobCount: number;
  color: string;
}

export default function CategoryCard({ title, icon, jobCount, color }: CategoryCardProps) {
  return (
    <Link to={`/jobs?category=${encodeURIComponent(title)}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-secondary/30 border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {jobCount} jobs available
        </p>
        <div className="flex items-center text-primary text-sm font-medium">
          <span>Browse Jobs</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </div>
      </motion.div>
    </Link>
  );
}
