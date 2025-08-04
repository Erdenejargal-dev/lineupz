const { google } = require('googleapis');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// Google Calendar OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate Google OAuth URL
const getAuthUrl = async (req, res) => {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: req.userId, // Pass user ID in state for security
      prompt: 'consent' // Force consent to get refresh token
    });

    res.json({
      success: true,
      authUrl
    });

  } catch (error) {
    console.error('Get auth URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate authorization URL'
    });
  }
};

// Handle OAuth callback and store tokens
const handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    // Verify state matches user ID for security
    if (state !== req.userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid state parameter'
      });
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getAccessToken(code);
    
    if (!tokens.access_token) {
      return res.status(400).json({
        success: false,
        message: 'Failed to obtain access token'
      });
    }

    // Set credentials for calendar API calls
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Get primary calendar info
    const calendarInfo = await calendar.calendars.get({
      calendarId: 'primary'
    });

    // Update user with Google Calendar tokens
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.googleCalendar = {
      connected: true,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      calendarId: calendarInfo.data.id,
      syncEnabled: true,
      connectedAt: new Date(),
      lastSyncAt: new Date()
    };

    // Mark calendar connection step as completed
    user.onboardingSteps.calendarConnection = true;

    // Check if onboarding is completed
    const steps = user.onboardingSteps;
    user.onboardingCompleted = steps.profileSetup && 
                               (steps.businessInfo || !user.isCreator) &&
                               steps.serviceSettings &&
                               steps.notificationPrefs;

    await user.save();

    res.json({
      success: true,
      message: 'Google Calendar connected successfully',
      calendar: {
        id: calendarInfo.data.id,
        summary: calendarInfo.data.summary,
        timeZone: calendarInfo.data.timeZone
      },
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Handle callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to connect Google Calendar'
    });
  }
};

// Disconnect Google Calendar
const disconnect = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Revoke Google tokens if they exist
    if (user.googleCalendar?.accessToken) {
      try {
        oauth2Client.setCredentials({
          access_token: user.googleCalendar.accessToken,
          refresh_token: user.googleCalendar.refreshToken
        });
        await oauth2Client.revokeCredentials();
      } catch (revokeError) {
        console.error('Failed to revoke Google tokens:', revokeError);
        // Continue with disconnection even if revoke fails
      }
    }

    // Clear Google Calendar data
    user.googleCalendar = {
      connected: false,
      accessToken: undefined,
      refreshToken: undefined,
      calendarId: undefined,
      syncEnabled: false,
      lastSyncAt: undefined,
      connectedAt: undefined
    };

    user.onboardingSteps.calendarConnection = false;

    await user.save();

    res.json({
      success: true,
      message: 'Google Calendar disconnected successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect Google Calendar'
    });
  }
};

// Sync appointment to Google Calendar
const syncAppointmentToCalendar = async (appointment, user) => {
  try {
    if (!user.googleCalendar?.connected || !user.googleCalendar?.syncEnabled) {
      return { success: false, message: 'Google Calendar not connected or sync disabled' };
    }

    // Set up OAuth client with user's tokens
    oauth2Client.setCredentials({
      access_token: user.googleCalendar.accessToken,
      refresh_token: user.googleCalendar.refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Populate appointment with line and user data
    await appointment.populate(['line', 'user']);

    const event = {
      summary: `${appointment.line.title} - ${appointment.user.name || 'Customer'}`,
      description: `Appointment booked through Tabi\n\nCustomer: ${appointment.user.name || 'Anonymous'}\nPhone: ${appointment.user.phone || 'Not provided'}\nNotes: ${appointment.notes || 'No notes'}`,
      start: {
        dateTime: appointment.appointmentTime.toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: appointment.endTime.toISOString(),
        timeZone: 'UTC'
      },
      attendees: [
        {
          email: user.email,
          displayName: user.businessName || user.name
        }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 15 }
        ]
      }
    };

    const response = await calendar.events.insert({
      calendarId: user.googleCalendar.calendarId,
      resource: event
    });

    return {
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink
    };

  } catch (error) {
    console.error('Sync appointment to calendar error:', error);
    
    // Handle token refresh if needed
    if (error.code === 401) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        user.googleCalendar.accessToken = credentials.access_token;
        if (credentials.refresh_token) {
          user.googleCalendar.refreshToken = credentials.refresh_token;
        }
        await user.save();
        
        // Retry the sync with new token
        return await syncAppointmentToCalendar(appointment, user);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return { success: false, message: 'Failed to refresh Google Calendar token' };
      }
    }

    return { success: false, message: error.message };
  }
};

// Check calendar availability
const checkAvailability = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time and end time are required'
      });
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.googleCalendar?.connected) {
      return res.status(400).json({
        success: false,
        message: 'Google Calendar not connected'
      });
    }

    // Set up OAuth client
    oauth2Client.setCredentials({
      access_token: user.googleCalendar.accessToken,
      refresh_token: user.googleCalendar.refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Check for conflicting events
    const response = await calendar.events.list({
      calendarId: user.googleCalendar.calendarId,
      timeMin: new Date(startTime).toISOString(),
      timeMax: new Date(endTime).toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    const conflicts = response.data.items.filter(event => {
      // Skip all-day events and events without start/end times
      return event.start?.dateTime && event.end?.dateTime;
    });

    res.json({
      success: true,
      available: conflicts.length === 0,
      conflicts: conflicts.map(event => ({
        id: event.id,
        summary: event.summary,
        start: event.start.dateTime,
        end: event.end.dateTime
      }))
    });

  } catch (error) {
    console.error('Check availability error:', error);
    
    // Handle token refresh
    if (error.code === 401) {
      try {
        const user = await User.findById(req.userId);
        const { credentials } = await oauth2Client.refreshAccessToken();
        user.googleCalendar.accessToken = credentials.access_token;
        if (credentials.refresh_token) {
          user.googleCalendar.refreshToken = credentials.refresh_token;
        }
        await user.save();
        
        // Retry availability check
        return await checkAvailability(req, res);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to check calendar availability'
    });
  }
};

// Get calendar status
const getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      calendar: {
        connected: user.googleCalendar?.connected || false,
        syncEnabled: user.googleCalendar?.syncEnabled || false,
        calendarId: user.googleCalendar?.calendarId,
        lastSyncAt: user.googleCalendar?.lastSyncAt,
        connectedAt: user.googleCalendar?.connectedAt
      }
    });

  } catch (error) {
    console.error('Get calendar status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get calendar status'
    });
  }
};

// Toggle sync enabled/disabled
const toggleSync = async (req, res) => {
  try {
    const { enabled } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.googleCalendar?.connected) {
      return res.status(400).json({
        success: false,
        message: 'Google Calendar not connected'
      });
    }

    user.googleCalendar.syncEnabled = enabled;
    await user.save();

    res.json({
      success: true,
      message: `Calendar sync ${enabled ? 'enabled' : 'disabled'}`,
      syncEnabled: enabled
    });

  } catch (error) {
    console.error('Toggle sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle calendar sync'
    });
  }
};

module.exports = {
  getAuthUrl,
  handleCallback,
  disconnect,
  syncAppointmentToCalendar,
  checkAvailability,
  getStatus,
  toggleSync
};
