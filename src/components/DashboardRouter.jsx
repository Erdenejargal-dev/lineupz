// ===== UPDATE: components/DashboardRouter.jsx =====
// Add this to your existing DashboardRouter to show appointments

'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Users, Clock, QrCode, LogOut, Plus, Calendar, X } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

// Add this new component to your DashboardRouter
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
        throw new Error(data.message || 'Failed to load appointments');
      }
    } catch (error) {
      setError(error.message);
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
        loadAppointments(); // Refresh the list
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

// Update your CustomerDashboardView component to include appointments
const CustomerDashboardViewEnhanced = ({ showCreatorOption = false }) => {
  const [activeTab, setActiveTab] = useState('queue'); // Add 'queue' and 'appointments' tabs
  const [myQueue, setMyQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    setToken(savedToken);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  // ... (keep your existing API calls and useEffects)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 pt-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Welcome back, {user?.name || 'there'}! 
              {showCreatorOption && <span className="text-blue-600"> (Creator Account)</span>}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

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
            <h3 className="font-medium text-gray-900 mb-1">
              {showCreatorOption ? 'Manage My Lines' : 'Create Lines'}
            </h3>
            <p className="text-sm text-gray-600">
              {showCreatorOption ? 'Switch to creator mode to manage your queues' : 'Switch to creator mode'}
            </p>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'queue' && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Current Queues</h2>
            
            {/* Your existing queue content */}
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
                {/* Your existing QueueCard components */}
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
};

export default CustomerDashboardViewEnhanced;
