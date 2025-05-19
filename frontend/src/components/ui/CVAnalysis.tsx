import React, { useEffect, useState } from 'react';
import { useAuthStore, useJobStore } from '@/store/store';
import { Job } from '@/store/store';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CVAnalysisResult {
  categories: string[];
  skills: string[];
  experience: string[];
  improvements: string[];
  score: number;
  matchedJobs: number;
}

export default function CVAnalysis() {
  const { user } = useAuthStore();
  const { jobs } = useJobStore();
  const navigate = useNavigate();
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [analysis, setAnalysis] = useState<CVAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.cv) {
      analyzeCV();
    }
  }, [user?.cv]);

  // Update the analyzeCV function
  const analyzeCV = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const response = await fetch('http://localhost:5000/api/analyze-cv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cvUrl: user?.cv }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to analyze CV');
        }
  
        const data = await response.json();
        setAnalysis(data);
        setRecommendedJobs(data.recommendations.map(rec => ({
          ...rec.payload,
          matchScore: Math.round(rec.score * 100)
        })));
        
        localStorage.setItem('cv-analysis', JSON.stringify(data));
      } catch (error) {
        console.error('CV analysis failed:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
  };
  
  // Update the job card in the render section
  {recommendedJobs.map(job => (
    <div
      key={job.id}
      className="bg-white dark:bg-secondary/30 rounded-lg p-4 border border-border"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={job.logo}
            alt={job.company}
            className="w-10 h-10 rounded"
          />
          <div>
            <h5 className="font-medium">{job.title}</h5>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
        </div>
        <div className="text-sm font-medium text-primary">
          {(job as Job & { matchScore?: number })?.matchScore ?? 0}% Match
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {job.skills?.slice(0, 3).map((skill, i) => (
          <span key={i} className="text-xs bg-secondary/50 px-2 py-1 rounded-full">
            {skill}
          </span>
        ))}
      </div>
      <div className="mt-2">
        <a
          href={`/jobs/${job.id}`}
          className="text-sm text-primary hover:underline"
        >
          View Details
        </a>
      </div>
    </div>
  ))}
  const countSkillMatches = (job: Job, skills: string[]) => {
    return skills.filter(skill => 
      job.title.toLowerCase().includes(skill.toLowerCase()) ||
      job.description.toLowerCase().includes(skill.toLowerCase())
    ).length;
  };

  // Update handleViewJobs function
  const handleViewJobs = () => {
    if (!analysis) return;
    
    navigate('/jobs', { 
      state: { 
        cvCategories: analysis.categories,
        cvSkills: analysis.skills,
        cvExperience: analysis.experience,
        matchThreshold: 0.6, // Minimum match score threshold
        recommendations: recommendedJobs.map(job => ({
          id: job.id,
          
        }))
      } 
    });
  };

  if (!user?.cv) {
    return (
      <p className="italic text-muted-foreground">
        No CV uploaded yet. Upload your CV to get started.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-primary/10 rounded-lg p-6">
        <h4 className="font-medium mb-4">CV Analysis Results</h4>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Analyzing your CV...</p>
        ) : analysis ? (
          <div className="space-y-6">
            {/* CV Score */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">CV Strength</span>
                <span className="text-sm text-muted-foreground">{analysis.score}%</span>
              </div>
              <Progress value={analysis.score} className="h-2" />
            </div>

            {/* Skills & Experience */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium mb-2">Detected Skills</h5>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 text-xs rounded-full bg-secondary/50">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-2">Experience</h5>
                <div className="flex flex-wrap gap-2">
                  {analysis.experience.map((exp, index) => (
                    <span key={index} className="px-2 py-1 text-xs rounded-full bg-secondary/50">
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Improvement Suggestions */}
            <div>
              <h5 className="text-sm font-medium mb-2">Suggestions for Improvement</h5>
              <ul className="space-y-2">
                {analysis.improvements.map((improvement, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>

            {/* Job Match */}
            <div className="bg-secondary/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h5 className="font-medium">Job Match</h5>
                  <p className="text-sm text-muted-foreground">
                    Found {analysis.matchedJobs} matching jobs
                  </p>
                </div>
                <Button onClick={handleViewJobs} variant="default">
                  View Matching Jobs
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Recommended Jobs Section */}
      {recommendedJobs.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Top Recommendations</h4>
          {recommendedJobs.map(job => (
            <div
              key={job.id}
              className="bg-white dark:bg-secondary/30 rounded-lg p-4 border border-border"
            >
              <div className="flex items-center gap-3">
                <img
                  src={job.logo}
                  alt={job.company}
                  className="w-10 h-10 rounded"
                />
                <div>
                  <h5 className="font-medium">{job.title}</h5>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
              </div>
              <div className="mt-2">
                <a
                  href={`/jobs/${job.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  View Details
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}