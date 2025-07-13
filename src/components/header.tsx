'use client';

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { LogOut, User, Menu, X } from 'lucide-react';

interface HeaderProps {
  onLogin?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogin }) => {
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsMobileMenuOpen(false);
    window.location.href = '/';
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Don't render user-specific content until client-side hydration
  if (!isClient) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl sm:text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                Tabi
              </Link>
            </div>
            <div className="w-8 h-8"></div> {/* Placeholder */}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-xl sm:text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
              onClick={closeMobileMenu}
            >
              Tabi
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {user ? (
              // Logged in state - Desktop
              <>
                <Link
                  href="/join"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  Join Line
                </Link>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="h-4 w-4" />
                    <span className="hidden lg:inline">
                      {user.name || `User ${user.userId}`}
                    </span>
                    <span className="lg:hidden">
                      {user.userId}
                    </span>
                  </div>
                  
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors bg-gray-900 text-white hover:bg-gray-800 h-9 px-3"
                  >
                    Dashboard
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-9 w-9"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              // Not logged in state - Desktop
              <>
                <Link
                  href="/join"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  Join Line
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors bg-gray-900 text-white hover:bg-gray-800 h-9 px-4"
                >
                  Login
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {user ? (
                // Logged in state - Mobile
                <>
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg mb-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || 'User'}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {user.userId}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <Link
                    href="/join"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Join Line
                  </Link>
                  
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                // Not logged in state - Mobile
                <>
                  <Link
                    href="/join"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Join Line
                  </Link>
                  
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-base font-medium bg-gray-900 text-white hover:bg-gray-800 rounded-md transition-colors text-center"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;