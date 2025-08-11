'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Save, ArrowLeft, RefreshCw } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [businessData, setBusinessData] = useState({
    ownedBusiness: null,
    affiliatedBusiness: null
  });

  const [businessForm, setBusinessForm] = useState({
    businessName: ''
  });

  const [showJoinBusiness, setShowJoinBusiness] = useState(false);
  const [joiningBusiness, setJoiningBusiness] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const fetchBusinessData = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/business/my-business`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBusinessData({
          ownedBusiness: data.ownedBusiness,
          affiliatedBusiness: data.affiliatedBusiness
        });
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
    }
  };

  useEffect(() => {
    setIsClient(true);
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    setToken(savedToken);
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setFormData({
          name: parsedUser.name || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || ''
        });
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
    
    if (savedToken) {
      fetchBusinessData();
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      fetchBusinessData();
    }
  }, [token]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Only send fields that are relevant to the user's current state
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };

      // Only include business fields if user is a creator
      if (user?.isCreator) {
        payload.businessName = formData.businessName;
        payload.businessDescription = formData.businessDescription;
        payload.businessAddress = formData.businessAddress;
        payload.businessWebsite = formData.businessWebsite;
        payload.businessCategory = formData.businessCategory;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in to edit your profile.</p>
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
        <RefreshCw className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 pt-20 sm:pt-24">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
          <p className="text-gray-600">Update your personal and business information</p>
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

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
              {user?.isEmailVerified && (
                <p className="text-xs text-green-600 mt-1">✓ Verified</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Business Affiliation Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Building className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Business Affiliation</h2>
          </div>

          {/* Current Business Status */}
          {businessData.ownedBusiness ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
              <h3 className="font-medium text-green-900 mb-2">🏢 Business Owner</h3>
              <p className="text-green-800">
                You own <strong>{businessData.ownedBusiness.name}</strong>
              </p>
              <button
                onClick={() => window.location.href = `/business/${businessData.ownedBusiness._id}/dashboard`}
                className="mt-2 text-green-700 hover:text-green-900 underline text-sm"
              >
                Manage Business →
              </button>
            </div>
          ) : businessData.affiliatedBusiness ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <h3 className="font-medium text-blue-900 mb-2">👨‍💼 Business Artist</h3>
              <p className="text-blue-800">
                You work at <strong>{businessData.affiliatedBusiness.name}</strong> as {businessData.affiliatedBusiness.role}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
              <h3 className="font-medium text-gray-900 mb-2">🔍 No Business Affiliation</h3>
              <p className="text-gray-700">
                You can either register your own business or join an existing business as an artist.
              </p>
            </div>
          )}

          {/* Business Options */}
          <div className="space-y-4">
            {/* Register Business Option */}
            {!businessData.ownedBusiness && (
              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <h3 className="font-medium text-purple-900 mb-2">🚀 Register Your Business</h3>
                <p className="text-purple-800 text-sm mb-3">
                  Start your own business with professional plans and manage multiple artists.
                </p>
                <button
                  onClick={() => window.location.href = '/business/register'}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Register Business
                </button>
              </div>
            )}

            {/* Join Business Option */}
            {!businessData.affiliatedBusiness && (
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="font-medium text-blue-900 mb-2">👥 Join a Business</h3>
                <p className="text-blue-800 text-sm mb-3">
                  Work as an artist for an existing business and share their subscription plan.
                </p>
                
                {!showJoinBusiness ? (
                  <button
                    onClick={() => setShowJoinBusiness(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Join Business
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">
                        Search Businesses
                      </label>
                      <input
                        type="text"
                        value={businessForm.businessName}
                        onChange={async (e) => {
                          const query = e.target.value;
                          setBusinessForm({ businessName: query });
                          
                          if (query.length >= 2) {
                            setSearching(true);
                            try {
                              const response = await fetch(`${API_BASE_URL}/business/search?query=${encodeURIComponent(query)}`, {
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                              });
                              
                              const data = await response.json();
                              if (data.success) {
                                setSearchResults(data.businesses);
                              }
                            } catch (error) {
                              console.error('Search error:', error);
                            } finally {
                              setSearching(false);
                            }
                          } else {
                            setSearchResults([]);
                          }
                        }}
                        className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type to search for businesses..."
                      />
                      {searching && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Searching...
                        </div>
                      )}
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        <p className="text-sm font-medium text-blue-900">Found {searchResults.length} business{searchResults.length > 1 ? 'es' : ''}:</p>
                        {searchResults.map((business) => (
                          <div 
                            key={business.id} 
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedBusiness?.id === business.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                            }`}
                            onClick={() => setSelectedBusiness(business)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{business.name}</h4>
                                {business.description && (
                                  <p className="text-sm text-gray-600 mt-1">{business.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span className="capitalize">{business.category}</span>
                                  <span>{business.currentArtistCount}/{business.subscription.maxArtists} Artists</span>
                                </div>
                              </div>
                              <div className="ml-4 text-right">
                                <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                  {business.subscription.planName}
                                </div>
                              </div>
                            </div>
                            
                            {/* Subscription Features */}
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <p className="text-xs font-medium text-gray-700 mb-1">Plan Features:</p>
                              <div className="flex flex-wrap gap-1">
                                {business.subscription.features.slice(0, 3).map((feature, index) => (
                                  <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {feature}
                                  </span>
                                ))}
                                {business.subscription.features.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{business.subscription.features.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No Results */}
                    {businessForm.businessName.length >= 2 && searchResults.length === 0 && !searching && (
                      <div className="text-sm text-gray-500 text-center py-4">
                        No businesses found matching "{businessForm.businessName}"
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={async () => {
                          if (!selectedBusiness) {
                            setError('Please select a business to join');
                            return;
                          }

                          try {
                            setJoiningBusiness(true);
                            const response = await fetch(`${API_BASE_URL}/business/join-request`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ 
                                businessName: selectedBusiness.name,
                                message: `Hi, I would like to join ${selectedBusiness.name} as an artist. I'm interested in working with your ${selectedBusiness.subscription.planName} and contributing to your team. Please review my request.`
                              })
                            });

                            const data = await response.json();
                            if (response.ok) {
                              setSuccess('Join request sent successfully! The business owner will review your request and notify you via email.');
                              setShowJoinBusiness(false);
                              setBusinessForm({ businessName: '' });
                              setSearchResults([]);
                              setSelectedBusiness(null);
                            } else {
                              setError(data.message || 'Failed to send join request');
                            }
                          } catch (error) {
                            setError('Failed to send join request');
                          } finally {
                            setJoiningBusiness(false);
                          }
                        }}
                        disabled={joiningBusiness || !selectedBusiness}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm flex items-center gap-2"
                      >
                        {joiningBusiness ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Sending Request...
                          </>
                        ) : (
                          'Send Join Request'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowJoinBusiness(false);
                          setBusinessForm({ businessName: '' });
                          setSearchResults([]);
                          setSelectedBusiness(null);
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>

                    {selectedBusiness && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-900">Selected Business:</p>
                        <p className="text-sm text-blue-800">{selectedBusiness.name} - {selectedBusiness.subscription.planName}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Individual Creator Option */}
        {!user?.isCreator && !businessData.ownedBusiness && !businessData.affiliatedBusiness && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Building className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Become a Creator</h2>
            </div>
            
            <p className="text-gray-700 mb-4">
              Want to create lines and manage appointments? Upgrade to a creator account to start managing queues and bookings for your business.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={async () => {
                  try {
                    setSaving(true);
                    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ isCreator: true })
                    });

                    const data = await response.json();
                    if (response.ok) {
                      localStorage.setItem('user', JSON.stringify(data.user));
                      setUser(data.user);
                      setSuccess('Creator account activated! You can now add business information.');
                      setTimeout(() => setSuccess(''), 3000);
                    } else {
                      setError(data.message || 'Failed to activate creator account');
                    }
                  } catch (error) {
                    setError('Failed to activate creator account');
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    <Building className="h-4 w-4" />
                    Become a Creator
                  </>
                )}
              </button>
              
              <button
                onClick={() => window.location.href = '/creator-dashboard'}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
