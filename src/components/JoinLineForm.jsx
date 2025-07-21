// ===== 1. UPDATE: components/JoinLineForm.jsx =====
// Replace your existing JoinLineForm with this enhanced version

'use client'
import React, { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + '/api';

const JoinLineForm = () => {
  const [step, setStep] = useState('code'); // 'code', 'preview', 'booking', 'joined'
  const [lineCode, setLineCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [lineInfo, setLineInfo] = useState(null);
  const [queuePosition, setQueuePosition] = useState(null);
  const [token, setToken] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Check for authentication and URL code on component mount
  React.useEffect(() => {
    setIsClient(true);
    const savedToken = localStorage.getItem('token');
    setToken(savedToken);
    
    // Check if there's a code in the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    
    if (codeFromUrl && codeFromUrl.length === 6) {
      setLineCode(codeFromUrl);
      // Automatically check the line code
      checkLineCodeFromUrl(codeFromUrl, savedToken);
    }
  }, []);

  const checkLineCodeFromUrl = async (code, token) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/lines/code/${code}`, {
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
      // If there's an error, stay on the code entry step
      setStep('code');
    } finally {
      setLoading(false);
    }
  };

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

  const resetForm = () => {
    setStep('code');
    setLineCode('');
    setError('');
    setMessage('');
    setLineInfo(null);
    setQueuePosition(null);
  };

  // Render different interfaces based on service type
  const renderJoinInterface = () => {
    if (!lineInfo) return null;

    switch (lineInfo.serviceType) {
      case 'queue':
        return <QueueJoinInterface lineInfo={lineInfo} onSuccess={setQueuePosition} setStep={setStep} />;
      
      case 'appointments':
        return <AppointmentBookingInterface lineInfo={lineInfo} onSuccess={setQueuePosition} setStep={setStep} />;
      
      case 'hybrid':
        return <HybridModeInterface lineInfo={lineInfo} onSuccess={setQueuePosition} setStep={setStep} />;
      
      default:
        return <QueueJoinInterface lineInfo={lineInfo} onSuccess={setQueuePosition} setStep={setStep} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6">
        <div>
          <h2 className="mt-4 text-center text-2xl md:text-3xl font-bold text-gray-900">
            {step === 'code' ? 'Join a Line' : 
             step === 'preview' ? 'Line Details' : 
             step === 'booking' ? 'Book Appointment' :
             'Success!'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 px-2">
            {step === 'code' 
              ? 'Enter the 6-digit line code to join' 
              : step === 'preview'
              ? `Ready to join ${lineInfo?.title}?`
              : step === 'booking'
              ? 'Select your preferred time slot'
              : 'You\'re all set!'}
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

        {step === 'code' && (
          <CodeEntryStep 
            lineCode={lineCode}
            setLineCode={setLineCode}
            onSubmit={checkLineCode}
            loading={loading}
            token={token}
          />
        )}

        {step === 'preview' && (
          <LinePreviewStep
            lineInfo={lineInfo}
            onBack={resetForm}
            onNext={() => setStep('booking')}
          />
        )}

        {step === 'booking' && (
          <div>
            {renderJoinInterface()}
            <button
              onClick={() => setStep('preview')}
              className="mt-4 w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Line Details
            </button>
          </div>
        )}

        {step === 'joined' && queuePosition && (
          <SuccessStep queuePosition={queuePosition} onReset={resetForm} />
        )}
      </div>
    </div>
  );
};

// ===== 2. NEW COMPONENT: Code Entry Step =====
const CodeEntryStep = ({ lineCode, setLineCode, onSubmit, loading, token }) => (
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
        className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl md:text-2xl font-mono tracking-widest"
        placeholder="123456"
        maxLength={6}
      />
    </div>

    <button
      onClick={onSubmit}
      disabled={loading || !lineCode || lineCode.length !== 6}
      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Checking...' : 'Check Line Code'}
    </button>

    {!token && (
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
  </div>
);

// ===== 3. NEW COMPONENT: Line Preview Step =====
const LinePreviewStep = ({ lineInfo, onBack, onNext }) => (
  <div className="space-y-6">
    <div className="bg-white border border-gray-300 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-2xl">
          {lineInfo.serviceType === 'queue' ? '🏃' : 
           lineInfo.serviceType === 'appointments' ? '📅' : '🔄'}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{lineInfo.title}</h3>
          <p className="text-sm text-gray-600">
            {lineInfo.serviceType === 'queue' ? 'Walk-in Queue' :
             lineInfo.serviceType === 'appointments' ? 'Appointment Booking' :
             'Queue + Appointments Available'}
          </p>
        </div>
      </div>
      
      {lineInfo.description && (
        <p className="text-sm text-gray-600 mb-3">{lineInfo.description}</p>
      )}
      
      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div>
          <p className="text-base md:text-lg font-semibold text-blue-600">
            {lineInfo.queueCount || 0}
          </p>
          <p className="text-xs text-gray-500">In Queue</p>
        </div>
        <div>
          <p className="text-base md:text-lg font-semibold text-orange-600">
            {lineInfo.estimatedWaitTime || 0}m
          </p>
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

      <p className="text-xs text-gray-500">
        Managed by {lineInfo.creator?.name || lineInfo.creator?.businessName || 'Anonymous'}
      </p>
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
          onClick={onBack}
          className="flex-1 py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800"
        >
          Continue
        </button>
      </div>
    )}
  </div>
);

// ===== 4. NEW COMPONENT: Queue Join Interface =====
const QueueJoinInterface = ({ lineInfo, onSuccess, setStep }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const joinQueue = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in first to join a line');
      setTimeout(() => window.location.href = '/login', 2000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/queue/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ lineCode: lineInfo.lineCode })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to join line');
      }

      setStep('joined');
      onSuccess(data.queueEntry);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-4 text-center">
        <h3 className="font-medium text-blue-900 mb-2">Join Queue</h3>
        <p className="text-sm text-blue-800">
          Current wait time: ~{lineInfo.estimatedWaitTime} minutes
        </p>
        <p className="text-sm text-blue-800">
          {lineInfo.queueCount} people ahead of you
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <button
        onClick={joinQueue}
        disabled={loading}
        className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {loading ? 'Joining...' : 'Join Queue Now'}
      </button>
    </div>
  );
};

// ===== 5. NEW COMPONENT: Appointment Booking Interface =====
const AppointmentBookingInterface = ({ lineInfo, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');

  // Set default date to today
  React.useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  // Load available slots when date changes
  React.useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadAvailableSlots = async () => {
    setLoading(true);
    setError('');
    setSelectedSlot(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/appointments/available-slots/${lineInfo.lineCode}?date=${selectedDate}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load available slots');
      }

      setAvailableSlots(data.slots || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in first to book an appointment');
      setTimeout(() => window.location.href = '/login', 2000);
      return;
    }

    if (!selectedSlot) {
      setError('Please select a time slot');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lineCode: lineInfo.lineCode,
          appointmentTime: selectedSlot.startTime,
          notes
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to book appointment');
      }

      onSuccess(data.appointment);
    } catch (error) {
      setError(error.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const formatSlotTime = (startTime, endTime) => {
    const start = new Date(startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const end = new Date(endTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${start} - ${end}`;
  };

  // Generate next 7 days for date selection
  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : 
               i === 1 ? 'Tomorrow' : 
               date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    
    return dates;
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Book Appointment</h3>
        <p className="text-sm text-blue-800">
          Duration: {lineInfo.appointmentSettings?.duration || 30} minutes
        </p>
      </div>

      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {getDateOptions().map(date => (
            <option key={date.value} value={date.value}>
              {date.label}
            </option>
          ))}
        </select>
      </div>

      {/* Time Slots */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Available Time Slots
        </label>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 mt-2">Loading slots...</p>
          </div>
        ) : availableSlots.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
            {availableSlots.filter(slot => slot.available).map((slot, index) => (
              <button
                key={index}
                onClick={() => setSelectedSlot(slot)}
                className={`p-3 text-left border rounded-lg transition-colors ${
                  selectedSlot === slot
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">
                  {formatSlotTime(slot.startTime, slot.endTime)}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No available slots for this date</p>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requests or notes..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <button
        onClick={bookAppointment}
        disabled={bookingLoading || !selectedSlot}
        className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {bookingLoading ? 'Booking...' : 'Book Appointment'}
      </button>
    </div>
  );
};

// ===== 6. NEW COMPONENT: Hybrid Mode Interface =====
const HybridModeInterface = ({ lineInfo, onSuccess }) => {
  const [mode, setMode] = useState('queue'); // 'queue' or 'appointment'

  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMode('queue')}
          className={`p-4 rounded-lg border text-center transition-colors ${
            mode === 'queue'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl mb-2">🏃</div>
          <div className="font-medium">Join Queue</div>
          <div className="text-sm text-gray-600">~{lineInfo.estimatedWaitTime}m wait</div>
        </button>

        <button
          onClick={() => setMode('appointment')}
          className={`p-4 rounded-lg border text-center transition-colors ${
            mode === 'appointment'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl mb-2">📅</div>
          <div className="font-medium">Book Slot</div>
          <div className="text-sm text-gray-600">Schedule ahead</div>
        </button>
      </div>

      {/* Render selected interface */}
      {mode === 'queue' ? (
        <QueueJoinInterface lineInfo={lineInfo} onSuccess={onSuccess} />
      ) : (
        <AppointmentBookingInterface lineInfo={lineInfo} onSuccess={onSuccess} />
      )}
    </div>
  );
};

// ===== 7. NEW COMPONENT: Success Step =====
const SuccessStep = ({ queuePosition, onReset }) => {
  const isAppointment = queuePosition.appointmentTime;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 md:h-16 md:w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="h-6 w-6 md:h-8 md:w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        {isAppointment ? (
          <div>
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
              {new Date(queuePosition.appointmentTime).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </div>
            <p className="text-sm text-gray-500 mb-4">Your appointment time</p>
          </div>
        ) : (
          <div>
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
              #{queuePosition.position}
            </div>
            <p className="text-sm text-gray-500 mb-4">Your position in line</p>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-center mb-4">
          <div>
            <p className="text-base md:text-lg font-semibold text-orange-600">
              {isAppointment ? 
                `${queuePosition.duration}m` : 
                `${queuePosition.estimatedWaitTime || 0}m`
              }
            </p>
            <p className="text-xs text-gray-500">
              {isAppointment ? 'Duration' : 'Est. wait time'}
            </p>
          </div>
          <div>
            <p className="text-base md:text-lg font-semibold text-gray-600">
              {isAppointment ?
                new Date(queuePosition.appointmentTime).toLocaleDateString() :
                queuePosition.joinedAt ? 
                  new Date(queuePosition.joinedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                  '--'
              }
            </p>
            <p className="text-xs text-gray-500">
              {isAppointment ? 'Date' : 'Joined at'}
            </p>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <p className="text-sm text-gray-600 mb-2">
            {isAppointment ? 
              'Your appointment has been confirmed. Please arrive on time.' :
              'Keep this page open for updates'
            }
          </p>
          <p className="text-xs text-gray-500">
            {isAppointment ?
              'You can cancel up to 2 hours before your appointment' :
              'You\'ll be notified when it\'s your turn'
            }
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onReset}
          className="flex-1 py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
        >
          Join Another
        </button>
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="flex-1 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800"
        >
          My Dashboard
        </button>
      </div>
    </div>
  );
};

export default JoinLineForm;
