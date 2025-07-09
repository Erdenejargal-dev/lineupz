'use client';

import React, { useState, useEffect } from 'react';
import { Users, Clock, MapPin, RefreshCw, LogOut, Plus, QrCode } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

const CustomerDashboard = () => {
  const [myQueue, setMyQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
    setToken(localStorage.getItem('token'));
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
        if (response.status === 401) {
          setToken(null);
          localStorage.removeItem('token');
          throw new Error('Please log in again');
        }
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
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
      await apiCall(`/queue/entry/${entryId}/leave`, {
        method: 'PATCH'
      });
      
      await loadMyQueue();
    } catch (error) {
      setError(error.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (token) {
      loadMyQueue();
    }
  }, [token]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (token && myQueue.length > 0) {
      const interval = setInterval(() => {
        loadMyQueue();
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [token, myQueue]);

  // Login check - show loading until client-side hydration
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

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in to see your queue positions.</p>
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

        <div className="bg-gray-50 p-3 rounded mb-4">
          <p className="text-sm text-gray-700 mb-2">
            <strong>What to expect:</strong>
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Keep this page open for updates</li>
            <li>• You'll be notified when it's your turn</li>
            <li>• Your position updates automatically</li>
          </ul>
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
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your queues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* REMOVED THE DUPLICATE HEADER - Main header is handled by layout */}
      
      {/* Page Title Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Lines</h1>
              <p className="text-gray-600">
                Welcome back, {user?.name || 'there'}! Here are your current queue positions.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={loadMyQueue}
                disabled={refreshing}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Quick Actions */}
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
            <h3 className="font-medium text-gray-900 mb-1">Create Lines</h3>
            <p className="text-sm text-gray-600">Switch to creator mode to manage queues</p>
          </button>
        </div>

        {/* Current Queues */}
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

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-3">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <div className="font-medium mb-1">1. Get a code</div>
              <div>Ask for a 6-digit line code from the business or service</div>
            </div>
            <div>
              <div className="font-medium mb-1">2. Join the line</div>
              <div>Enter the code and see your position in the queue</div>
            </div>
            <div>
              <div className="font-medium mb-1">3. Wait your turn</div>
              <div>Get real-time updates on your position and wait time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;