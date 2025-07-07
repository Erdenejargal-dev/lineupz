'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Users, Clock, QrCode, LogOut, Plus, Eye, EyeOff, UserCheck, TrendingUp, MapPin } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const DashboardRouter = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
    const savedToken = localStorage.getItem('token');
    setToken(savedToken);
  }, []);

  // Load user data to determine dashboard type
  const loadUserData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('Please log in again');
        }
        throw new Error(data.message || 'Failed to load user data');
      }

      setUser(data.user);
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(data.user));
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadUserData();
    }
  }, [token]);

  // Client-side hydration check
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // No token - redirect to login
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access your dashboard.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Loading user data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error loading user data
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Route to correct dashboard based on user type - but give creators choice
  if (user?.isCreator || user?.totalLinesCreated > 0) {
    // User is a creator - but show customer dashboard with option to switch
    return <CustomerDashboardView showCreatorOption={true} />;
  } else {
    // Regular user - show customer dashboard
    return <CustomerDashboardView showCreatorOption={false} />;
  }
};

// Customer Dashboard Component
const CustomerDashboardView = ({ showCreatorOption = false }) => {
  const [myQueue, setMyQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  // API helper function
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Load user's queue positions
  const loadMyQueue = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiCall('/queue/my-queue');
      setMyQueue(data.queueEntries || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Leave a line
  const leaveLine = async (entryId) => {
    try {
      setRefreshing(true);
      await apiCall(`/queue/entry/${entryId}/leave`, { method: 'PATCH' });
      await loadMyQueue();
    } catch (error) {
      setError(error.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadMyQueue();
    }
  }, [token]);

  const QueueCard = ({ queueEntry, onLeave }) => {
    const formatTimeAgo = (date) => {
      const minutes = Math.round((Date.now() - new Date(date)) / 60000);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.round(minutes / 60);
      return `${hours}h ago`;
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{queueEntry.line.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{queueEntry.line.description}</p>
          </div>
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
            {queueEntry.line.lineCode}
          </span>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              #{queueEntry.position}
            </div>
            <p className="text-sm text-blue-800">Your position in line</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-orange-600">
              {queueEntry.estimatedWaitTime || 0}m
            </p>
            <p className="text-xs text-gray-500">Estimated wait</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-600">
              {formatTimeAgo(queueEntry.joinedAt)}
            </p>
            <p className="text-xs text-gray-500">Joined</p>
          </div>
        </div>

        <button
          onClick={() => onLeave(queueEntry._id)}
          disabled={refreshing}
          className="w-full bg-red-50 text-red-600 py-2 px-4 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {refreshing ? 'Leaving...' : 'Leave Line'}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-12 w-12 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* REMOVED THE DUPLICATE HEADER - No internal header at all */}
      
      <div className="max-w-4xl mx-auto p-6 pt-20">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Lines</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Welcome back, {user?.name || 'there'}! 
              {showCreatorOption && <span className="text-blue-600"> (Creator Account)</span>}
            </p>
            <button 
              onClick={loadMyQueue} 
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => window.location.href = '/join'}
            className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 hover:bg-gray-50 transition-colors text-center"
          >
            <QrCode className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Join a Line</h3>
            <p className="text-sm text-gray-600">Enter a 6-digit code to join a queue</p>
          </button>

          <button
            onClick={() => window.location.href = '/creator-dashboard'}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center"
          >
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">
              {showCreatorOption ? 'Manage My Lines' : 'Create Lines'}
            </h3>
            <p className="text-sm text-gray-600">
              {showCreatorOption ? 'Switch to creator mode to manage your queues' : 'Switch to creator mode'}
            </p>
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Current Queues</h2>
          
          {myQueue.length === 0 ? (
            <div className="text-center py-12">
              <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active queues</h3>
              <p className="text-gray-600 mb-6">You're not currently waiting in any lines.</p>
              <button
                onClick={() => window.location.href = '/join'}
                className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Join Your First Line
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myQueue.map(queueEntry => (
                <QueueCard
                  key={queueEntry._id}
                  queueEntry={queueEntry}
                  onLeave={leaveLine}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardRouter;