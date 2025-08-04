'use client';

import React, { useState, useEffect } from 'react';
import { Users, Clock, MapPin, RefreshCw, LogOut, Plus, QrCode, Calendar, X } from 'lucide-react';
import SimpleOnboardingFlow from '@/components/SimpleOnboardingFlow';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

// Appointments component
const MyAppointments = ({ token }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/appointments/my-appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setAppointments(data.appointments || []);
      } else {
        if (response.status === 404) {
          setAppointments([]);
          setError('');
        } else {
          throw new Error(data.message || 'Failed to load appointments');
        }
      }
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('404')) {
        setAppointments([]);
        setError('');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Cancelled by user' })
      });
      
      if (response.ok) {
        loadAppointments();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      loadAppointments();
    }
  }, [token]);

  const formatAppointmentTime = (appointmentTime) => {
    const date = new Date(appointmentTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    if (isToday) return `Today at ${timeStr}`;
    if (isTomorrow) return `Tomorrow at ${timeStr}`;
    
    return `${date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    })} at ${timeStr}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">My Appointments</h3>
        <button
          onClick={loadAppointments}
          className="text-gray-600 hover:text-gray-900 p-1"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No upcoming appointments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{appointment.line.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatAppointmentTime(appointment.appointmentTime)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Duration: {appointment.duration} minutes
                  </p>
                  {appointment.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      "{appointment.notes}"
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    appointment.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800'
                      : appointment.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status}
                  </span>
                  
                  {appointment.canCancel && (
                    <button
                      onClick={() => cancelAppointment(appointment._id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Cancel appointment"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('queue');
  const [myQueue, setMyQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    setToken(savedToken);
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Check if user needs onboarding
        if (!parsedUser.onboardingCompleted) {
          setShowOnboarding(true);
        }
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Refresh user data from localStorage (updated by onboarding flow)
    const updatedUser = localStorage.getItem('user');
    if (updatedUser) {
      try {
        setUser(JSON.parse(updatedUser));
      } catch (e) {
        console.error('Error parsing updated user:', e);
      }
    }
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

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

  // Show onboarding flow if needed
  if (showOnboarding && user) {
    // Determine user type - customer by default, creator if they have creator flag
    const userType = user.isCreator ? 'creator' : 'customer';
    
    return (
      <SimpleOnboardingFlow
        user={user}
        userType={userType}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

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
          <p className="text-gray-600 mb-6">Please log in to see your dashboard.</p>
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
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 pt-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Welcome back, {user?.name || 'there'}!
            </p>
            <div className="flex items-center gap-2">
              {user && !user.onboardingCompleted && (
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Complete Setup
                </button>
              )}
              <button 
                onClick={() => window.location.reload()}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Onboarding Reminder Banner */}
        {user && !user.onboardingCompleted && !showOnboarding && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">Complete Your Profile Setup</h3>
                  <p className="text-sm text-blue-700">
                    Set up your profile and connect Google Calendar for the best experience.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOnboarding(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'queue'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="h-4 w-4" />
            Queue Lines
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'appointments'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Appointments
          </button>
        </div>

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
            <p className="text-sm text-gray-600">Enter a 6-digit code to join a queue or book appointment</p>
          </button>

          <button
            onClick={() => window.location.href = '/creator-dashboard'}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center"
          >
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Create Lines</h3>
            <p className="text-sm text-gray-600">Switch to creator mode to manage queues and appointments</p>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'queue' && (
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
        )}

        {activeTab === 'appointments' && (
          <div className="mb-8">
            <MyAppointments token={token} />
          </div>
        )}
      </div>
    </div>
  );
}
