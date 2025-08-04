const { google } = require('googleapis');

class GoogleMeetService {
  constructor() {
    this.calendar = null;
  }

  // Initialize Google Calendar API with user's tokens
  async initializeCalendar(accessToken, refreshToken) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
      });

      this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Calendar:', error);
      return false;
    }
  }

  // Create a Google Meet meeting for an appointment
  async createMeeting(appointmentData, creatorTokens, userEmail) {
    try {
      if (!this.calendar) {
        const initialized = await this.initializeCalendar(
          creatorTokens.accessToken,
          creatorTokens.refreshToken
        );
        if (!initialized) {
          throw new Error('Failed to initialize Google Calendar');
        }
      }

      const startTime = new Date(appointmentData.appointmentTime);
      const endTime = new Date(appointmentData.endTime);

      // Create calendar event with Google Meet
      const event = {
        summary: appointmentData.title || 'Tabi Appointment',
        description: appointmentData.description || appointmentData.notes || 'Appointment booked through Tabi',
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC'
        },
        attendees: [
          { email: userEmail, responseStatus: 'needsAction' }
        ],
        conferenceData: {
          createRequest: {
            requestId: `tabi-${appointmentData._id || Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 30 }       // 30 minutes before
          ]
        }
      };

      // Create the event with conference data
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all' // Send invites to attendees
      });

      const createdEvent = response.data;
      const conferenceData = createdEvent.conferenceData;

      if (conferenceData && conferenceData.entryPoints) {
        // Extract Google Meet details
        const meetingUrl = conferenceData.entryPoints.find(
          entry => entry.entryPointType === 'video'
        )?.uri;

        const phoneEntry = conferenceData.entryPoints.find(
          entry => entry.entryPointType === 'phone'
        );

        return {
          success: true,
          eventId: createdEvent.id,
          meetingUrl: meetingUrl,
          conferenceId: conferenceData.conferenceId,
          entryPoints: conferenceData.entryPoints,
          conferenceSolution: conferenceData.conferenceSolution,
          phoneNumber: phoneEntry?.uri,
          pin: phoneEntry?.pin,
          eventLink: createdEvent.htmlLink
        };
      } else {
        throw new Error('Failed to create Google Meet conference');
      }

    } catch (error) {
      console.error('Error creating Google Meet:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update an existing meeting
  async updateMeeting(eventId, appointmentData, creatorTokens, userEmail) {
    try {
      if (!this.calendar) {
        const initialized = await this.initializeCalendar(
          creatorTokens.accessToken,
          creatorTokens.refreshToken
        );
        if (!initialized) {
          throw new Error('Failed to initialize Google Calendar');
        }
      }

      const startTime = new Date(appointmentData.appointmentTime);
      const endTime = new Date(appointmentData.endTime);

      const event = {
        summary: appointmentData.title || 'Tabi Appointment',
        description: appointmentData.description || appointmentData.notes || 'Appointment booked through Tabi',
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC'
        },
        attendees: [
          { email: userEmail, responseStatus: 'needsAction' }
        ]
      };

      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
        sendUpdates: 'all'
      });

      return {
        success: true,
        eventId: response.data.id,
        eventLink: response.data.htmlLink
      };

    } catch (error) {
      console.error('Error updating Google Meet:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cancel/delete a meeting
  async cancelMeeting(eventId, creatorTokens) {
    try {
      if (!this.calendar) {
        const initialized = await this.initializeCalendar(
          creatorTokens.accessToken,
          creatorTokens.refreshToken
        );
        if (!initialized) {
          throw new Error('Failed to initialize Google Calendar');
        }
      }

      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all'
      });

      return {
        success: true,
        message: 'Meeting cancelled successfully'
      };

    } catch (error) {
      console.error('Error cancelling Google Meet:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get meeting details
  async getMeetingDetails(eventId, creatorTokens) {
    try {
      if (!this.calendar) {
        const initialized = await this.initializeCalendar(
          creatorTokens.accessToken,
          creatorTokens.refreshToken
        );
        if (!initialized) {
          throw new Error('Failed to initialize Google Calendar');
        }
      }

      const response = await this.calendar.events.get({
        calendarId: 'primary',
        eventId: eventId
      });

      const event = response.data;
      const conferenceData = event.conferenceData;

      if (conferenceData) {
        const meetingUrl = conferenceData.entryPoints?.find(
          entry => entry.entryPointType === 'video'
        )?.uri;

        return {
          success: true,
          eventId: event.id,
          meetingUrl: meetingUrl,
          conferenceId: conferenceData.conferenceId,
          entryPoints: conferenceData.entryPoints,
          eventLink: event.htmlLink
        };
      }

      return {
        success: false,
        error: 'No conference data found'
      };

    } catch (error) {
      console.error('Error getting meeting details:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new GoogleMeetService();
