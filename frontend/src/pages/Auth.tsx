
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuthStore } from '@/store/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, signup, isAuthenticated } = useAuthStore();

  // Get mode and returnUrl from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const modeParam = params.get('mode');
    if (modeParam === 'login' || modeParam === 'signup') {
      setMode(modeParam);
    }
  }, [location.search]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const params = new URLSearchParams(location.search);
      const returnUrl = params.get('returnUrl');
      navigate(returnUrl || '/dashboard');
    }
  }, [isAuthenticated, navigate, location.search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (mode === 'signup' && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password);
      }
      
      // Navigation is handled by the useEffect above
    } catch (error: any) {
      setErrors({
        form: error.message || (mode === 'login' 
          ? 'Invalid email or password' 
          : 'Failed to create account')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setErrors({});
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen pt-32 pb-20">
        <div className="page-container">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-secondary/30 rounded-xl shadow-sm border border-border p-8"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-display font-medium mb-2">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-muted-foreground">
                  {mode === 'login' 
                    ? 'Sign in to access your account' 
                    : 'Join our platform to find your dream job'}
                </p>
              </div>
              
              {errors.form && (
                <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                  {errors.form}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                  {mode === 'signup' && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                              errors.name 
                                ? 'border-destructive' 
                                : 'border-input focus:border-primary'
                            }`}
                          />
                        </div>
                        {errors.name && (
                          <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        errors.email 
                          ? 'border-destructive' 
                          : 'border-input focus:border-primary'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    {mode === 'login' && (
                      <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot Password?
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        errors.password 
                          ? 'border-destructive' 
                          : 'border-input focus:border-primary'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <>{mode === 'login' ? 'Sign In' : 'Create Account'}</>
                  )}
                </button>
              </form>
              
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-center text-muted-foreground">
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                  <button
                    onClick={toggleMode}
                    className="ml-2 text-primary hover:underline transition-colors"
                  >
                    {mode === 'login' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </motion.div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                By signing up, you agree to our
                <Link to="/terms" className="text-primary hover:underline mx-1">Terms of Service</Link>
                and
                <Link to="/privacy" className="text-primary hover:underline ml-1">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
