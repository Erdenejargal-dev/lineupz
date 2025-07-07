'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Users, Clock, TrendingUp, Settings, QrCode, Eye, EyeOff, Trash2, UserCheck, LogOut, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const CreatorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLine, setSelectedLine] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [queueLoading, setQueueLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Initialize client-side only
  useEffect(() => {
    setIsClient(true);
    setToken(localStorage.getItem('token'));
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

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiCall('/dashboard/overview');
      setDashboardData(data.dashboard);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load queue data for selected line
  const loadQueueData = async (lineId) => {
    try {
      setQueueLoading(true);
      const [queueResponse, statsResponse] = await Promise.all([
        apiCall(`/queue/line/${lineId}`),
        apiCall(`/queue/line/${lineId}/stats`)
      ]);
      
      setQueueData({
        ...queueResponse,
        stats: statsResponse.stats
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setQueueLoading(false);
    }
  };

  // Toggle line availability
  const toggleLineAvailability = async (lineId) => {
    try {
      setRefreshing(true);
      await apiCall(`/lines/${lineId}/toggle-availability`, {
        method: 'PATCH'
      });
      
      await loadDashboardData();
    } catch (error) {
      setError(error.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Mark person as visited
  const markAsVisited = async (entryId, notes = '') => {
    try {
      await apiCall(`/queue/entry/${entryId}/visited`, {
        method: 'PATCH',
        body: JSON.stringify({ notes })
      });
      
      if (selectedLine) {
        await loadQueueData(selectedLine._id);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Remove person from queue
  const removeFromQueue = async (entryId, reason = '') => {
    try {
      await apiCall(`/queue/entry/${entryId}/remove`, {
        method: 'PATCH',
        body: JSON.stringify({ reason })
      });
      
      if (selectedLine) {
        await loadQueueData(selectedLine._id);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Create new line
  const createNewLine = async (lineData) => {
    try {
      setCreateLoading(true);
      const newLine = await apiCall('/lines', {
        method: 'POST',
        body: JSON.stringify(lineData)
      });
      
      await loadDashboardData();
      setShowCreateModal(false);
      
      return newLine;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setCreateLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (token && dashboardData) {
      const interval = setInterval(() => {
        loadDashboardData();
        if (selectedLine) {
          loadQueueData(selectedLine._id);
        }
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [token, dashboardData, selectedLine]);

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

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const LineCard = ({ line, onSelect, onToggle }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{line.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {line.lineCode}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              line.isCurrentlyAvailable 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {line.isCurrentlyAvailable ? 'Available' : 'Closed'}
            </span>
          </div>
        </div>
        <button
          onClick={() => onToggle(line._id)}
          disabled={refreshing}
          className={`p-2 rounded-lg transition-colors ${
            line.isActive 
              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${refreshing ? 'opacity-50' : ''}`}
        >
          {refreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : line.isActive ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-blue-600">{line.queueCount || 0}</p>
          <p className="text-xs text-gray-500">In Queue</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-green-600">{line.servedToday || 0}</p>
          <p className="text-xs text-gray-500">Served Today</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-orange-600">{line.estimatedWaitTime || 0}m</p>
          <p className="text-xs text-gray-500">Est. Wait</p>
        </div>
      </div>
      
      <button
        onClick={() => onSelect(line)}
        className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
      >
        Manage Queue
      </button>
    </div>
  );

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
          <button
            onClick={loadDashboardData}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {dashboardData?.user?.name || 'Creator'} 
            {dashboardData?.user?.businessName && ` • ${dashboardData.user.businessName}`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={loadDashboardData}
            disabled={refreshing}
            className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Line
          </button>
        </div>

        {/* Stats Overview */}
        {dashboardData?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Lines"
              value={dashboardData.stats.totalLines}
              subtitle={`${dashboardData.stats.activeLines} active`}
              icon={QrCode}
              color="blue"
            />
            <StatCard
              title="People in Queue"
              value={dashboardData.stats.totalInQueue}
              subtitle={`${dashboardData.stats.todayJoined} joined today`}
              icon={Users}
              color="orange"
            />
            <StatCard
              title="Total Served"
              value={dashboardData.stats.totalServed}
              subtitle={`${dashboardData.stats.todayServed} today`}
              icon={UserCheck}
              color="green"
            />
            <StatCard
              title="Completion Rate"
              value={dashboardData.stats.totalServed > 0 
                ? `${Math.round((dashboardData.stats.totalServed / (dashboardData.stats.totalServed + dashboardData.stats.totalInQueue)) * 100)}%`
                : '0%'
              }
              subtitle="People served"
              icon={TrendingUp}
              color="purple"
            />
          </div>
        )}

        {/* Lines Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Lines</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData?.recentLines?.length > 0 ? (
                dashboardData.recentLines.map(line => (
                  <LineCard
                    key={line._id}
                    line={line}
                    onSelect={(line) => {
                      setSelectedLine(line);
                      loadQueueData(line._id);
                    }}
                    onToggle={toggleLineAvailability}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No lines created yet</p>
                  <p>Create your first line to start managing queues</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Analytics Coming Soon</h3>
              <p className="text-gray-600">
                Detailed analytics including wait times, peak hours, and performance metrics will be available here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;