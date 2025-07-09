'use client'
import React, { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

const QuickJoinForm = () => {
  const [lineCode, setLineCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!lineCode || lineCode.length !== 6) {
      setError('Please enter a valid 6-digit line code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if line exists first
      const response = await fetch(`${API_BASE_URL}/lines/code/${lineCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Line not found');
      }

      // Redirect to full join page with the code
      window.location.href = `/join?code=${lineCode}`;
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4">
        <div>
          <label htmlFor="quickLineCode" className="block text-sm font-medium text-gray-700 mb-2">
            Join with Line Code
          </label>
          <input
            id="quickLineCode"
            name="quickLineCode"
            type="text"
            value={lineCode}
            onChange={(e) => setLineCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-xl font-mono tracking-widest"
            placeholder="123456"
            maxLength={6}
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleJoin}
          disabled={loading || !lineCode || lineCode.length !== 6}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Checking...' : 'Join Line'}
        </button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Enter the 6-digit code from your line creator
        </p>
      </div>
    </div>
  );
};

export default QuickJoinForm;