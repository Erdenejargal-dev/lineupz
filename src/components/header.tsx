'use client';

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { LogOut, User } from 'lucide-react';

interface HeaderProps {
  onLogin?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogin }) => {
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

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
    window.location.href = '/';
  };

  // Don't render user-specific content until client-side hydration
  if (!isClient) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                Tabi
              </Link>
            </div>
            <nav className="flex items-center gap-4">
              <div className="w-20 h-10"></div> {/* Placeholder to prevent layout shift */}
            </nav>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              Tabi
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            {user ? (
              // Logged in state
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
                    <span className="hidden sm:inline">
                      {user.name || `User ${user.userId}`}
                    </span>
                    <span className="sm:hidden">
                      {user.userId}
                    </span>
                  </div>
                  
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-900 text-white hover:bg-gray-800 h-10 px-4 py-2"
                  >
                    Dashboard
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-10 w-10"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              // Not logged in state
              <>
                <Link
                  href="/join"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  Join Line
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gray-900 text-white hover:bg-gray-800 h-10 px-4 py-2"
                >
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;