'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, Plus, RefreshCw, LogOut, Eye, EyeOff, 
  UserCheck, BarChart3, Settings, Copy, Check, QrCode,
  TrendingUp, Calendar, User
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

const CreatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [myLines, setMyLines] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [managingLine, setManagingLine] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    }
  }, []);

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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [overviewData, linesData] = await Promise.all([
        apiCall('/dashboard/overview'),
        apiCall('/lines/my-lines')
      ]);
      setDashboardData(overviewData.dashboard);
      setMyLines(linesData.lines);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createLine = async (lineData) => {
    try {
      setRefreshing(true);
      await apiCall('/lines', {
        method: 'POST',
        body: JSON.stringify(lineData)
      });
      await loadDashboardData();
    } catch (error) {
      setError(error.message);
    } finally {
      setRefreshing(false);
    }
  };

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

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Creator Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access the creator dashboard.</p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-12 w-12 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {user?.businessName || user?.name || 'Creator'}!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={loadDashboardData}
                disabled={refreshing}
                className="text-gray-600 hover:text-gray-900 p-2"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="text-gray-600 hover:text-gray-900 p-2"
                title="Customer View"
              >
                <User className="h-4 w-4" />
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                className="text-gray-600 hover:text-gray-900 p-2"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'lines', name: 'My Lines', icon: QrCode },
              { id: 'analytics', name: 'Analytics', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {activeTab === 'overview' && (
          <OverviewTab dashboardData={dashboardData} />
        )}

        {activeTab === 'lines' && (
          <LinesTab 
            myLines={myLines} 
            onCreateLine={createLine}
            onToggleAvailability={toggleLineAvailability}
            refreshing={refreshing}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab token={token} />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ dashboardData }) => {
  const stats = dashboardData?.stats || {};
  
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Lines"
          value={stats.totalLines || 0}
          icon={QrCode}
          color="blue"
        />
        <StatCard
          title="Active Lines"
          value={stats.activeLines || 0}
          icon={Eye}
          color="green"
        />
        <StatCard
          title="People Served"
          value={stats.totalServed || 0}
          icon={UserCheck}
          color="purple"
        />
        <StatCard
          title="In Queue Now"
          value={stats.totalInQueue || 0}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Today's Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.todayJoined || 0}</div>
            <div className="text-sm text-gray-500">People Joined</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.todayServed || 0}</div>
            <div className="text-sm text-gray-500">People Served</div>
          </div>
        </div>
      </div>

      {/* Recent Lines */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Lines</h3>
        {dashboardData?.recentLines?.length > 0 ? (
          <div className="space-y-4">
            {dashboardData.recentLines.map((line) => (
              <div key={line._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{line.title}</h4>
                  <p className="text-sm text-gray-500">Code: {line.lineCode}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{line.currentQueue}</div>
                  <div className="text-xs text-gray-500">in queue</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No lines created yet</p>
        )}
      </div>
    </div>
  );
};

// Lines Tab Component
const LinesTab = ({ myLines, onCreateLine, onToggleAvailability, refreshing }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [managingLine, setManagingLine] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [queueLoading, setQueueLoading] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    maxCapacity: 50,
    estimatedServiceTime: 5,
    serviceType: 'queue', // NEW: queue, appointments, hybrid
    codeType: 'stable',
    schedule: [
      { day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false },
      { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false },
    ],
    // NEW: Appointment settings for appointment/hybrid lines
    appointmentSettings: {
      duration: 30,
      slotInterval: 30,
      advanceBookingDays: 7,
      bufferTime: 5,
      cancellationHours: 2,
      autoConfirm: true,
      maxConcurrentAppointments: 1
    }
  });

  const updateSchedule = (dayIndex, field, value) => {
    const newSchedule = [...createFormData.schedule];
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], [field]: value };
    setCreateFormData({ ...createFormData, schedule: newSchedule });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    await onCreateLine(createFormData);
    setShowCreateForm(false);
    setCreateFormData({
      title: '',
      description: '',
      maxCapacity: 50,
      estimatedServiceTime: 5,
      serviceType: 'queue',
      codeType: 'stable',
      schedule: [
        { day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false },
        { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false },
      ],
      appointmentSettings: {
        duration: 30,
        slotInterval: 30,
        advanceBookingDays: 7,
        bufferTime: 5,
        cancellationHours: 2,
        autoConfirm: true,
        maxConcurrentAppointments: 1
      }
    });
  };

  const handleManageLine = (line) => {
    setManagingLine(line);
  };

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  return (
    <div className="space-y-6">
      {/* Create Line Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">My Lines</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Line
        </button>
      </div>

      {/* Line Management Modal */}
      {managingLine && (
        <LineManagementModal 
          line={managingLine} 
          onClose={() => setManagingLine(null)}
          onUpdate={() => {
            loadDashboardData();
            setManagingLine(null);
          }}
        />
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <CreateLineModal 
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateSubmit}
          refreshing={refreshing}
        />
      )}

      {/* Old Create Form - Remove this entire section */}
      {false && showCreateForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Line</h3>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Line Title *
              </label>
              <input
                type="text"
                required
                value={createFormData.title}
                onChange={(e) => setCreateFormData({...createFormData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Coffee Shop Queue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={createFormData.description}
                onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Queue for coffee orders"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={createFormData.maxCapacity}
                  onChange={(e) => setCreateFormData({...createFormData, maxCapacity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Time (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={createFormData.estimatedServiceTime}
                  onChange={(e) => setCreateFormData({...createFormData, estimatedServiceTime: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type *
              </label>
              <select
                value={createFormData.serviceType}
                onChange={(e) => setCreateFormData({...createFormData, serviceType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="queue">Queue Only - People join and wait in line</option>
                <option value="appointments">Appointments Only - People book specific time slots</option>
                <option value="hybrid">Hybrid - Both queue and appointment booking</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {createFormData.serviceType === 'queue' && '🏃 Traditional queue system - first come, first served'}
                {createFormData.serviceType === 'appointments' && '📅 Appointment booking - customers schedule specific times'}
                {createFormData.serviceType === 'hybrid' && '🔄 Flexible - customers can either join queue or book appointments'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code Type
              </label>
              <select
                value={createFormData.codeType}
                onChange={(e) => setCreateFormData({...createFormData, codeType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="stable">Stable (permanent code)</option>
                <option value="temporary">Temporary (expires in 24h)</option>
              </select>
            </div>

            {/* Appointment Settings - Only show for appointments/hybrid */}
            {(createFormData.serviceType === 'appointments' || createFormData.serviceType === 'hybrid') && (
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Appointment Settings
                </label>
                <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-blue-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Appointment Duration (minutes)
                      </label>
                      <select
                        value={createFormData.appointmentSettings.duration}
                        onChange={(e) => setCreateFormData({
                          ...createFormData, 
                          appointmentSettings: {
                            ...createFormData.appointmentSettings,
                            duration: parseInt(e.target.value)
                          }
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5 hours</option>
                        <option value={120}>2 hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Time Slot Interval
                      </label>
                      <select
                        value={createFormData.appointmentSettings.slotInterval}
                        onChange={(e) => setCreateFormData({
                          ...createFormData, 
                          appointmentSettings: {
                            ...createFormData.appointmentSettings,
                            slotInterval: parseInt(e.target.value)
                          }
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value={15}>Every 15 minutes</option>
                        <option value={30}>Every 30 minutes</option>
                        <option value={60}>Every hour</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Advance Booking (days)
                      </label>
                      <select
                        value={createFormData.appointmentSettings.advanceBookingDays}
                        onChange={(e) => setCreateFormData({
                          ...createFormData, 
                          appointmentSettings: {
                            ...createFormData.appointmentSettings,
                            advanceBookingDays: parseInt(e.target.value)
                          }
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value={1}>1 day ahead</option>
                        <option value={3}>3 days ahead</option>
                        <option value={7}>1 week ahead</option>
                        <option value={14}>2 weeks ahead</option>
                        <option value={30}>1 month ahead</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Cancellation Policy (hours)
                      </label>
                      <select
                        value={createFormData.appointmentSettings.cancellationHours}
                        onChange={(e) => setCreateFormData({
                          ...createFormData, 
                          appointmentSettings: {
                            ...createFormData.appointmentSettings,
                            cancellationHours: parseInt(e.target.value)
                          }
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value={1}>1 hour before</option>
                        <option value={2}>2 hours before</option>
                        <option value={4}>4 hours before</option>
                        <option value={24}>24 hours before</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={createFormData.appointmentSettings.autoConfirm}
                        onChange={(e) => setCreateFormData({
                          ...createFormData, 
                          appointmentSettings: {
                            ...createFormData.appointmentSettings,
                            autoConfirm: e.target.checked
                          }
                        })}
                        className="mr-2"
                      />
                      <span className="text-xs text-gray-700">Auto-confirm appointments</span>
                    </label>
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    💡 Perfect for hairstylists, doctors, consultants, and other appointment-based services
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Section */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Operating Hours
              </label>
              <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="text-sm text-gray-600 mb-3">
                  Set your line's operating hours for each day of the week:
                </div>
                {createFormData.schedule.map((day, index) => (
                  <div key={day.day} className="flex items-center gap-3">
                    <div className="w-24 flex-shrink-0">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={day.isAvailable}
                          onChange={(e) => updateSchedule(index, 'isAvailable', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium capitalize">{dayNames[day.day]}</span>
                      </label>
                    </div>
                    
                    {day.isAvailable && (
                      <>
                        <div className="flex-1">
                          <input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <span className="text-gray-500 text-sm">to</span>
                        <div className="flex-1">
                          <input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </>
                    )}
                    
                    {!day.isAvailable && (
                      <div className="flex-1 text-center text-sm text-gray-500">
                        Closed
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="text-xs text-gray-500 mt-2">
                  💡 Tip: Your line will only be available during these hours. People can't join outside these times.
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={refreshing}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {refreshing ? 'Creating...' : 'Create Line'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lines Grid */}
      {myLines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myLines.map((line) => (
            <LineCard
              key={line._id}
              line={line}
              onToggleAvailability={() => onToggleAvailability(line._id)}
              onManageLine={handleManageLine}
              refreshing={refreshing}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <QrCode className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lines yet</h3>
          <p className="text-gray-600 mb-6">Create your first line to start managing queues.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Create Your First Line
          </button>
        </div>
      )}
    </div>
  );
};

// Line Card Component
const LineCard = ({ line, onToggleAvailability, refreshing, onManageLine }) => {
  const [copied, setCopied] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(line.lineCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleAvailability = async () => {
    setIsToggling(true);
    try {
      await onToggleAvailability();
    } catch (error) {
      console.error('Toggle failed:', error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{line.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{line.description}</p>
        </div>
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          line.isAvailable 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {line.isAvailable ? 'Active' : 'Paused'}
        </span>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-mono font-bold text-gray-900">{line.lineCode}</span>
          <button
            onClick={copyCode}
            className="text-gray-600 hover:text-gray-900 p-1"
            title="Copy code"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Share this code with customers</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">{line.queueCount || 0}</div>
          <div className="text-xs text-gray-500">In Queue</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-orange-600">{line.estimatedWaitTime || 0}m</div>
          <div className="text-xs text-gray-500">Wait Time</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-600">{line.settings?.maxCapacity || 0}</div>
          <div className="text-xs text-gray-500">Capacity</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleToggleAvailability}
          disabled={refreshing || isToggling}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
            line.isAvailable
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-600 hover:bg-green-100'
          }`}
        >
          {isToggling ? 'Updating...' : (line.isAvailable ? 'Pause' : 'Activate')}
        </button>
        <button
          onClick={() => onManageLine(line)}
          className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800"
        >
          Manage
        </button>
      </div>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ token }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(false);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/dashboard/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAnalyticsData(data.analytics);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAnalytics();
    }
  }, [token, period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Line Performance */}
      {analyticsData?.linePerformance && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Line Performance</h3>
          {analyticsData.linePerformance.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.linePerformance.map((line) => (
                <div key={line.lineId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{line.title}</h4>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {line.lineCode}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">{line.totalJoined}</div>
                      <div className="text-xs text-gray-500">Joined</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">{line.totalServed}</div>
                      <div className="text-xs text-gray-500">Served</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">{Math.round(line.avgWaitTime)}m</div>
                      <div className="text-xs text-gray-500">Avg Wait</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">{Math.round(line.conversionRate)}%</div>
                      <div className="text-xs text-gray-500">Completion</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available for this period</p>
          )}
        </div>
      )}

      {/* Quick Insights */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Insights</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>📊 Analytics help you understand your queue performance</p>
          <p>⏱️ Track average wait times to optimize service</p>
          <p>📈 Monitor completion rates to improve customer satisfaction</p>
          <p>👥 See peak hours to plan staffing better</p>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Create Line Form Component
const CreateLineForm = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxCapacity: 50,
    estimatedServiceTime: 5,
    codeType: 'stable',
    schedule: [
      { day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false },
      { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false },
    ]
  });

  const [showSchedule, setShowSchedule] = useState(true);

  const updateSchedule = (dayIndex, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], [field]: value };
    setFormData({ ...formData, schedule: newSchedule });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        title: '',
        description: '',
        maxCapacity: 50,
        estimatedServiceTime: 5,
        codeType: 'stable',
        schedule: [
          { day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false },
          { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false },
        ]
      });
    } catch (error) {
      // Error is handled by parent component
    }
  };

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Line Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Coffee Shop Queue"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Queue for coffee orders and pickup"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Capacity
          </label>
          <input
            type="number"
            min="1"
            max="200"
            value={formData.maxCapacity}
            onChange={(e) => setFormData({...formData, maxCapacity: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Time (minutes)
          </label>
          <input
            type="number"
            min="1"
            max="60"
            value={formData.estimatedServiceTime}
            onChange={(e) => setFormData({...formData, estimatedServiceTime: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Code Type
        </label>
        <select
          value={formData.codeType}
          onChange={(e) => setFormData({...formData, codeType: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="stable">Stable (permanent code)</option>
          <option value="temporary">Temporary (expires in 24h)</option>
        </select>
      </div>

      {/* Schedule Section */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Operating Hours
          </label>
          <button
            type="button"
            onClick={() => setShowSchedule(!showSchedule)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showSchedule ? 'Hide Schedule' : 'Set Schedule'}
          </button>
        </div>
        
        {showSchedule && (
          <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="text-sm text-gray-600 mb-3">
              Set your line's operating hours for each day of the week:
            </div>
            {formData.schedule.map((day, index) => (
              <div key={day.day} className="flex items-center gap-3">
                <div className="w-24 flex-shrink-0">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={day.isAvailable}
                      onChange={(e) => updateSchedule(index, 'isAvailable', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium capitalize">{dayNames[day.day]}</span>
                  </label>
                </div>
                
                {day.isAvailable && (
                  <>
                    <div className="flex-1">
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <span className="text-gray-500 text-sm">to</span>
                    <div className="flex-1">
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
                
                {!day.isAvailable && (
                  <div className="flex-1 text-center text-sm text-gray-500">
                    Closed
                  </div>
                )}
              </div>
            ))}
            
            <div className="text-xs text-gray-500 mt-2">
              💡 Tip: Your line will only be available during these hours. People can't join outside these times.
            </div>
          </div>
        )}
        
        {!showSchedule && (
          <div className="text-sm text-gray-500 italic">
            Click "Set Schedule" to configure operating hours (optional)
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Line'}
        </button>
      </div>
    </form>
  );
};

// Line Management Component
const LineManagement = ({ line, queueData, queueLoading, onMarkVisited, onRemoveFromQueue, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('queue');

  if (queueLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Line Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{line.title}</h3>
            <p className="text-sm text-gray-600">{line.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{line.lineCode}</div>
            <div className="text-sm text-gray-500">Line Code</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{queueData?.totalInQueue || 0}</div>
          <div className="text-sm text-gray-600">In Queue</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{queueData?.stats?.totalServed || 0}</div>
          <div className="text-sm text-gray-600">Served Today</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{queueData?.stats?.estimatedWaitTime || 0}m</div>
          <div className="text-sm text-gray-600">Est. Wait</div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Queue List */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Current Queue</h4>
        {queueData?.queue?.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {queueData.queue.map((person, index) => (
              <div key={person._id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium">{person.name || 'Anonymous'}</div>
                    <div className="text-sm text-gray-500">ID: {person.userId}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onMarkVisited(person._id)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                  >
                    Mark Visited
                  </button>
                  <button
                    onClick={() => onRemoveFromQueue(person._id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No one in queue yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

// NEW: Create Line Modal with Tabs
const CreateLineModal = ({ onClose, onSubmit, refreshing }) => {
  const [activeTab, setActiveTab] = useState('queue');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxCapacity: 50,
    estimatedServiceTime: 5,
    serviceType: 'queue',
    codeType: 'stable',
    schedule: [
      { day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false },
      { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false },
    ],
    appointmentSettings: {
      duration: 30,
      slotInterval: 30,
      advanceBookingDays: 7,
      bufferTime: 5,
      cancellationHours: 2,
      autoConfirm: true,
      maxConcurrentAppointments: 1
    }
  });

  const updateSchedule = (dayIndex, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], [field]: value };
    setFormData({ ...formData, schedule: newSchedule });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = { ...formData, serviceType: activeTab };
    await onSubmit(submitData);
    onClose();
  };

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Create New Line</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Service Type Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'queue', name: 'Queue Only', icon: '🏃', desc: 'Traditional line system' },
              { id: 'appointments', name: 'Appointments', icon: '📅', desc: 'Time slot booking' },
              { id: 'hybrid', name: 'Hybrid', icon: '🔄', desc: 'Both options' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="text-lg mb-1">{tab.icon}</span>
                <span className="font-medium">{tab.name}</span>
                <span className="text-xs text-gray-500">{tab.desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Line Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    activeTab === 'queue' ? 'Coffee Shop Queue' :
                    activeTab === 'appointments' ? 'Hair Salon Appointments' :
                    'Restaurant Service'
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder={
                    activeTab === 'queue' ? 'Queue for coffee orders and pickup' :
                    activeTab === 'appointments' ? 'Professional hair styling and cuts' :
                    'Dine-in and takeout orders'
                  }
                />
              </div>

              {/* Only show capacity and service time for queue and hybrid */}
              {(activeTab === 'queue' || activeTab === 'hybrid') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Capacity
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={formData.maxCapacity}
                      onChange={(e) => setFormData({...formData, maxCapacity: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Time (minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="240"
                      value={formData.estimatedServiceTime}
                      onChange={(e) => setFormData({...formData, estimatedServiceTime: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {/* For appointments only, show a note */}
              {activeTab === 'appointments' && (
                <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    📅 <strong>Appointment Mode:</strong> Capacity and service time are managed through appointment duration and scheduling below.
                  </p>
                </div>
              )}
            </div>

            {/* Appointment Settings - Only show for appointments/hybrid */}
            {(activeTab === 'appointments' || activeTab === 'hybrid') && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium text-blue-900 mb-4">Appointment Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Duration
                    </label>
                    <select
                      value={formData.appointmentSettings.duration}
                      onChange={(e) => setFormData({
                        ...formData, 
                        appointmentSettings: {
                          ...formData.appointmentSettings,
                          duration: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Slot Interval
                    </label>
                    <select
                      value={formData.appointmentSettings.slotInterval}
                      onChange={(e) => setFormData({
                        ...formData, 
                        appointmentSettings: {
                          ...formData.appointmentSettings,
                          slotInterval: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={15}>Every 15 minutes</option>
                      <option value={30}>Every 30 minutes</option>
                      <option value={60}>Every hour</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Advance Booking
                    </label>
                    <select
                      value={formData.appointmentSettings.advanceBookingDays}
                      onChange={(e) => setFormData({
                        ...formData, 
                        appointmentSettings: {
                          ...formData.appointmentSettings,
                          advanceBookingDays: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1 day ahead</option>
                      <option value={3}>3 days ahead</option>
                      <option value={7}>1 week ahead</option>
                      <option value={14}>2 weeks ahead</option>
                      <option value={30}>1 month ahead</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cancellation Policy
                    </label>
                    <select
                      value={formData.appointmentSettings.cancellationHours}
                      onChange={(e) => setFormData({
                        ...formData, 
                        appointmentSettings: {
                          ...formData.appointmentSettings,
                          cancellationHours: parseInt(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1 hour before</option>
                      <option value={2}>2 hours before</option>
                      <option value={4}>4 hours before</option>
                      <option value={24}>24 hours before</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.appointmentSettings.autoConfirm}
                      onChange={(e) => setFormData({
                        ...formData, 
                        appointmentSettings: {
                          ...formData.appointmentSettings,
                          autoConfirm: e.target.checked
                        }
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Auto-confirm appointments</span>
                  </label>
                </div>
              </div>
            )}

            {/* Operating Hours */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Operating Hours</h4>
              <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                {formData.schedule.map((day, index) => (
                  <div key={day.day} className="flex items-center gap-3">
                    <div className="w-24 flex-shrink-0">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={day.isAvailable}
                          onChange={(e) => updateSchedule(index, 'isAvailable', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium">{dayNames[day.day]}</span>
                      </label>
                    </div>
                    
                    {day.isAvailable ? (
                      <>
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-gray-500 text-sm">to</span>
                        <input
                          type="time"
                          value={day.endTime}
                          onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </>
                    ) : (
                      <div className="flex-1 text-center text-sm text-gray-500">Closed</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={refreshing}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {refreshing ? 'Creating...' : `Create ${activeTab === 'queue' ? 'Queue' : activeTab === 'appointments' ? 'Appointment Line' : 'Hybrid Line'}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// NEW: Line Management Modal
const LineManagementModal = ({ line, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [editData, setEditData] = useState({
    title: line.title || '',
    description: line.description || '',
    maxCapacity: line.settings?.maxCapacity || 50,
    estimatedServiceTime: line.settings?.estimatedServiceTime || 5,
    schedule: line.availability?.schedule || [
      { day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false },
      { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false },
    ]
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateSchedule = (dayIndex, field, value) => {
    const newSchedule = [...editData.schedule];
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], [field]: value };
    setEditData({ ...editData, schedule: newSchedule });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/lines/${line._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update line');
      }

      await onUpdate();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Manage Line</h3>
              <p className="text-sm text-gray-600">Code: {line.lineCode}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'details', name: 'Line Details', icon: '📝' },
              { id: 'schedule', name: 'Schedule', icon: '🕒' },
              { id: 'queue', name: 'Current Queue', icon: '👥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Line Title
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={editData.maxCapacity}
                    onChange={(e) => setEditData({...editData, maxCapacity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={editData.estimatedServiceTime}
                    onChange={(e) => setEditData({...editData, estimatedServiceTime: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Operating Hours</h4>
              <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                {editData.schedule.map((day, index) => (
                  <div key={day.day} className="flex items-center gap-3">
                    <div className="w-24 flex-shrink-0">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={day.isAvailable}
                          onChange={(e) => updateSchedule(index, 'isAvailable', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium">{dayNames[day.day]}</span>
                      </label>
                    </div>
                    
                    {day.isAvailable ? (
                      <>
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-gray-500 text-sm">to</span>
                        <input
                          type="time"
                          value={day.endTime}
                          onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </>
                    ) : (
                      <div className="flex-1 text-center text-sm text-gray-500">Closed</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'queue' && (
            <div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{line.queueCount || 0}</div>
                  <div className="text-sm text-gray-600">In Queue</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{line.estimatedWaitTime || 0}m</div>
                  <div className="text-sm text-gray-600">Est. Wait</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{line.settings?.maxCapacity || 0}</div>
                  <div className="text-sm text-gray-600">Capacity</div>
                </div>
              </div>

              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Queue management coming soon</p>
                <p className="text-sm">Real-time queue monitoring and management tools</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
