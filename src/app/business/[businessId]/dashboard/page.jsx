'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Building, Users, TrendingUp, Clock, Check, X, Mail, Phone, User, ArrowLeft } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

export default function BusinessDashboardPage() {
  const params = useParams();
  const businessId = params.businessId;
  
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [business, setBusiness] = useState(null);
  const [artistStats, setArtistStats] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      window.location.href = '/login';
      return;
    }
    setToken(savedToken);
    fetchBusinessData(savedToken);
  }, [businessId]);

  const fetchBusinessData = async (authToken) => {
    try {
      // Validate business ID
      if (!businessId || businessId === 'undefined') {
        setError('Invalid business ID');
        window.location.href = '/profile';
        return;
      }

      // Get dashboard data directly using the business ID from URL
      const dashboardResponse = await fetch(`${API_BASE_URL}/business/${businessId}/dashboard`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const dashboardData = await dashboardResponse.json();
      if (dashboardData.success) {
        setBusiness(dashboardData.business);
        setArtistStats(dashboardData.artistStats);
      } else {
        setError(dashboardData.message || 'Failed to load business data');
        return;
      }

      // Get join requests
      const requestsResponse = await fetch(`${API_BASE_URL}/business/${businessId}/join-requests`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const requestsData = await requestsResponse.json();
      if (requestsData.success) {
        setJoinRequests(requestsData.requests);
      }

    } catch (error) {
      console.error('Error fetching business data:', error);
      setError('Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResponse = async (requestId, action) => {
    try {
      const response = await fetch(`${API_BASE_URL}/business/${businessId}/join-requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`Request ${action}d successfully`);
        // Refresh data
        fetchBusinessData(token);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || `Failed to ${action} request`);
      }
    } catch (error) {
      setError(`Failed to ${action} request`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const pendingRequests = joinRequests.filter(req => req.status === 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 pt-20 sm:pt-24">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.location.href = '/profile'}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {business?.name} Dashboard
              </h1>
              <p className="text-gray-600">
                {business?.subscription?.plan?.charAt(0).toUpperCase() + business?.subscription?.plan?.slice(1)} Plan • 
                {business?.currentArtistCount}/{business?.maxArtists} Artists
              </p>
            </div>
            
            {pendingRequests.length > 0 && (
              <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                {pendingRequests.length} Pending Request{pendingRequests.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
                activeTab === 'requests'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Join Requests
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('artists')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'artists'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Artists
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Artists</p>
                    <p className="text-2xl font-bold text-gray-900">{business?.currentArtistCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{business?.stats?.totalCustomers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <Building className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Lines</p>
                    <p className="text-2xl font-bold text-gray-900">{business?.stats?.totalLines || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Plan</p>
                  <p className="text-lg font-bold text-purple-600 capitalize">
                    {business?.subscription?.plan} Plan
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Artist Limit</p>
                  <p className="text-lg font-bold text-gray-900">
                    {business?.currentArtistCount}/{business?.maxArtists}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-lg font-bold text-green-600">Active</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Join Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {joinRequests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Join Requests</h3>
                <p className="text-gray-600">When artists request to join your business, they'll appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {joinRequests.map((request) => (
                  <div key={request._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="bg-gray-100 rounded-full p-3">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            {request.user.name || 'Unknown User'}
                          </h4>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-4 w-4 mr-2" />
                              {request.user.email || 'No email'}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              {request.user.phone || 'No phone'}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="h-4 w-4 mr-2" />
                              ID: {request.user.userId}
                            </div>
                          </div>
                          {request.message && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">{request.message}</p>
                            </div>
                          )}
                          <p className="mt-2 text-xs text-gray-500">
                            Requested {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {request.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleRequestResponse(request._id, 'approve')}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                              <Check className="h-4 w-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRequestResponse(request._id, 'decline')}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                              <X className="h-4 w-4" />
                              Decline
                            </button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            request.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Artists Tab */}
        {activeTab === 'artists' && (
          <div className="space-y-6">
            {artistStats.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Artists Yet</h3>
                <p className="text-gray-600">Approved artists will appear here with their performance statistics.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artistStats.map((artist) => (
                  <div key={artist.artist._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="bg-purple-100 rounded-full p-3">
                        <User className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{artist.artist.name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{artist.role}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Lines Created</span>
                        <span className="text-sm font-medium text-gray-900">{artist.stats.totalLines}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Customers Served</span>
                        <span className="text-sm font-medium text-gray-900">{artist.stats.totalCustomers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Revenue</span>
                        <span className="text-sm font-medium text-gray-900">₮{artist.stats.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Joined</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(artist.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
