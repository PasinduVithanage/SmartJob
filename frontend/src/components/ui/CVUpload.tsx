
import React, { useState } from 'react';
import { Upload, Check, X, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/store';
import { motion, AnimatePresence } from 'framer-motion';

export default function CVUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const { user, uploadCV } = useAuthStore();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Check file type
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      setError('Please upload a PDF or Word document');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return;
    }

    setFile(file);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      await uploadCV(file);
      setFile(null);
      // Show success message
    } catch (error) {
      setError('Failed to upload CV. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Already has CV
  if (user?.cv) {
    return (
      <div className="bg-white dark:bg-secondary/30 rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">CV Uploaded</h3>
              <p className="text-sm text-muted-foreground">Your CV is ready for job applications</p>
            </div>
          </div>
          <button
            onClick={() => uploadCV(null as any)} // This would clear the CV in a real app
            className="text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            Replace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-secondary/30 rounded-xl border border-border p-6 shadow-sm">
      <h3 className="font-medium mb-2">Upload Your CV</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Upload your CV to get personalized job recommendations
      </p>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-input hover:border-primary/50 hover:bg-secondary/50'
        }`}
      >
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
                <Check className="h-6 w-6" />
              </div>
              <p className="font-medium mb-1">{file.name}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setFile(null)}
                  className="text-sm px-3 py-1 border border-input rounded-md hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium mb-1">Drag and drop your CV here</p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports PDF, DOC, or DOCX (up to 5MB)
              </p>
              <label
                htmlFor="cv-upload"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Browse Files
              </label>
              <input
                id="cv-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive flex items-center">
          <X className="h-4 w-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
