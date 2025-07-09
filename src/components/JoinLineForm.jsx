'use client'
import React, { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

const JoinLineForm = () => {
  const [step, setStep] = useState('code'); // 'code', 'preview', or 'joined'
  const [lineCode, setLineCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [lineInfo, setLineInfo] = useState(null);
  const [queuePosition, setQueuePosition] = useState(null);
  const [token, setToken] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Check for authentication on component mount
  React.useEffect(() => {
    setIsClient(true);
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    setToken(savedToken);
    console.log('Auth check - Token exists:', !!savedToken);
    console.log('Auth check - User exists:', !!savedUser);
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        console.log('Current user ID:', user.userId);
      } catch (e) {
        console.log('Error parsing user:', e);
      }
    }
  }, []);

  const checkLineCode = async () => {
    if (!lineCode || lineCode.length !== 6) {
      setError('Please enter a valid 6-digit line code');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/lines/code/${lineCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Line not found');
      }

      setLineInfo(data.line);
      setMessage(`Found line: ${data.line.title}`);
      setStep('preview');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const joinLine = async () => {
    // Check token again right before joining
    const currentToken = localStorage.getItem('token');
    const currentUser = localStorage.getItem('user');
    
    console.log('=== JOIN LINE DEBUG ===');
    console.log('Token exists:', !!currentToken);
    console.log('Token value:', currentToken ? currentToken.substring(0, 20) + '...' : 'null');
    console.log('User exists:', !!currentUser);
    
    if (!currentToken) {
      console.log('No token found - redirecting to login');
      setError('Please log in first to join a line');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        console.log('Joining as user:', user.userId);
      } catch (e) {
        console.log('Error parsing user for join:', e);
      }
    }

    setLoading(true);
    setError('');

    try {
      console.log('Making API call to join line...');
      const response = await fetch(`${API_BASE_URL}/queue/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ lineCode })
      });

      console.log('Join response status:', response.status);
      const data = await response.json();
      console.log('Join response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join line');
      }

      setQueuePosition(data.queueEntry);
      setStep('joined');
    } catch (error) {
      console.log('Join error:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('code');
    setLineCode('');
    setError('');
    setMessage('');
    setLineInfo(null);
    setQueuePosition(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6">
        <div>
          <h2 className="mt-4 text-center text-2xl md:text-3xl font-bold text-gray-900">
            {step === 'code' ? 'Join a Line' : step === 'preview' ? 'Line Details' : 'You\'re in Line!'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 px-2">
            {step === 'code' 
              ? 'Enter the 6-digit line code to join' 
              : step === 'preview'
              ? `Ready to join ${lineInfo?.title}?`
              : `Position #${queuePosition?.position} in ${queuePosition?.line?.title}`
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
            {message}
          </div>
        )}

        {step === 'code' ? (
          <div className="space-y-6">
            <div>
              <label htmlFor="lineCode" className="block text-sm font-medium text-gray-700 mb-2">
                Line Code
              </label>
              <input
                id="lineCode"
                name="lineCode"
                type="text"
                required
                value={lineCode}
                onChange={(e) => setLineCode(e.target.value.toUpperCase())}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-xl md:text-2xl font-mono tracking-widest"
                placeholder="123456"
                maxLength={6}
              />
              <p className="mt-2 text-xs text-gray-500 text-center">
                Ask the line creator for this 6-digit code
              </p>
            </div>

            <button
              onClick={checkLineCode}
              disabled={loading || !lineCode || lineCode.length !== 6}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking...' : 'Check Line Code'}
            </button>
          </div>
        ) : step === 'preview' ? (
          <div className="space-y-6">
            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2 break-words">{lineInfo.title}</h3>
              {lineInfo.description && (
                <p className="text-sm text-gray-600 mb-3 break-words">{lineInfo.description}</p>
              )}
              
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                  <p className="text-base md:text-lg font-semibold text-blue-600">{lineInfo.queueCount}</p>
                  <p className="text-xs text-gray-500">In Queue</p>
                </div>
                <div>
                  <p className="text-base md:text-lg font-semibold text-orange-600">{lineInfo.estimatedWaitTime}m</p>
                  <p className="text-xs text-gray-500">Est. Wait</p>
                </div>
                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    lineInfo.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {lineInfo.isAvailable ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 break-words">
                Managed by {lineInfo.creator?.name || lineInfo.creator?.businessName || 'Anonymous'}
              </p>

              {lineInfo.userInLine && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  You're already in this line at position #{lineInfo.userInLine.position}
                </div>
              )}
            </div>

            {!lineInfo.isAvailable ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 text-center">
                  This line is currently closed. Please try again later.
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetForm}
                  className="flex-1 py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Back
                </button>
                <button
                  onClick={joinLine}
                  disabled={loading || lineInfo.userInLine}
                  className="flex-1 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Joining...' : lineInfo.userInLine ? 'Already Joined' : 'Join Line'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 md:h-16 md:w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-6 w-6 md:h-8 md:w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                #{queuePosition?.position}
              </div>
              <p className="text-sm text-gray-500 mb-4">Your position in line</p>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-center mb-4">
                <div>
                  <p className="text-base md:text-lg font-semibold text-orange-600">
                    {queuePosition?.estimatedWaitTime}m
                  </p>
                  <p className="text-xs text-gray-500">Est. wait time</p>
                </div>
                <div>
                  <p className="text-base md:text-lg font-semibold text-gray-600">
                    {queuePosition?.joinedAt ? new Date(queuePosition.joinedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}
                  </p>
                  <p className="text-xs text-gray-500">Joined at</p>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600 mb-2 break-words">
                  {queuePosition?.line?.description || 'Keep this page open for updates'}
                </p>
                <p className="text-xs text-gray-500">
                  You'll be notified when it's your turn
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetForm}
                className="flex-1 py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Join Another
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                My Dashboard
              </button>
            </div>
          </div>
        )}

        {step === 'code' && !token && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Don't have an account?{' '}
              <button
                onClick={() => window.location.href = '/login'}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up here
              </button>
            </p>
          </div>
        )}

        {step === 'code' && (
          <div className="text-center">
            <p className="text-xs text-gray-500 px-4">
              Need help? Contact the line creator for the correct code.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinLineForm;