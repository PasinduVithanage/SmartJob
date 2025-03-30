
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Briefcase, Search } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useAuthStore } from '@/store/store';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find Jobs', path: '/jobs' },
    { name: user?.isAdmin ? 'Admin' : 'Dashboard', path: user?.isAdmin ? '/admin' : '/dashboard' },
  ];

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-black/80 backdrop-blur-lg shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="page-container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center space-x-2">
          <Briefcase className="h-8 w-8 text-primary" />
          <span className="text-xl font-display font-medium">JobFinder</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            // Only show admin/dashboard link if authenticated
            if ((link.path === '/admin' && (!isAuthenticated || !user?.isAdmin)) || 
                (link.path === '/dashboard' && (!isAuthenticated || user?.isAdmin))) {
              return null;
            }
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium relative py-2 ${
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-foreground hover:text-primary transition-colors'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2 text-sm font-medium hover:text-primary transition-colors">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
              </Link>
              <button 
                onClick={logout}
                className="text-sm font-medium px-4 py-2 rounded-full border border-input hover:bg-accent transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              <Link 
                to="/auth?mode=login" 
                className="text-sm font-medium px-4 py-2 rounded-full border border-input hover:bg-accent transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/auth?mode=signup" 
                className="text-sm font-medium px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
          
          <button
            className="md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 bg-background transform ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out md:hidden`}
        style={{ top: '64px' }}
      >
        <nav className="flex flex-col p-8 space-y-6">
          {navLinks.map((link) => {
            // Only show admin/dashboard link if authenticated
            if ((link.path === '/admin' && (!isAuthenticated || !user?.isAdmin)) || 
                (link.path === '/dashboard' && (!isAuthenticated || user?.isAdmin))) {
              return null;
            }
            
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-lg font-medium ${
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            );
          })}
          
          {isAuthenticated ? (
            <>
              <div className="pt-4 border-t border-border">
                <p className="text-muted-foreground mb-2">Signed in as {user?.name}</p>
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-center py-3 rounded-full border border-input"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 border-t border-border space-y-3">
              <Link 
                to="/auth?mode=login" 
                className="block w-full text-center py-3 rounded-full border border-input"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/auth?mode=signup" 
                className="block w-full text-center py-3 rounded-full bg-primary text-primary-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
