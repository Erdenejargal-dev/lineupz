# Google OAuth Scope Justification for Tabi

## Application Overview
**Tabi** is a queue management and appointment scheduling platform that helps businesses streamline their customer service operations. The application integrates with Google Calendar to provide seamless appointment scheduling, calendar synchronization, and Google Meet integration for virtual appointments.

## Required Google API Scopes and Detailed Justifications

### 1. `https://www.googleapis.com/auth/calendar` (ESSENTIAL)

**Why This Scope is Required:**
- **Primary Function**: Tabi is fundamentally a calendar-based appointment scheduling system
- **Core Business Logic**: The application creates, manages, and synchronizes appointments directly with users' Google Calendars
- **Calendar Management**: Users need to manage their business calendars, set availability, and handle appointment scheduling

**Specific Use Cases:**
- Creating calendar events for customer appointments
- Reading calendar metadata (timezone, calendar settings)
- Managing calendar properties and settings
- Accessing primary calendar information for business users

**Why More Limited Scopes Are Insufficient:**
- `calendar.readonly` alone would prevent appointment creation
- `calendar.events` alone doesn't provide access to calendar metadata needed for proper timezone handling and calendar configuration
- Without full calendar access, the core business functionality of appointment scheduling would be impossible

**Code Evidence:**
```javascript
// From googleCalendarController.js - Line 75
const calendarInfo = await calendar.calendars.get({
  calendarId: 'primary'
});

// Calendar metadata is stored for business operations
user.googleCalendar = {
  calendarId: calendarInfo.data.id,
  // ... other calendar settings
};
```

### 2. `https://www.googleapis.com/auth/calendar.events` (ESSENTIAL)

**Why This Scope is Required:**
- **Appointment Creation**: Core functionality requires creating calendar events for customer appointments
- **Event Management**: Updating, canceling, and managing appointment events
- **Google Meet Integration**: Creating events with Google Meet conference data
- **Availability Checking**: Reading existing events to prevent scheduling conflicts

**Specific Use Cases:**
- Creating appointment events with customer details
- Adding Google Meet links to virtual appointments
- Setting up event reminders and notifications
- Managing event attendees (business owner + customer)
- Checking for scheduling conflicts

**Why More Limited Scopes Are Insufficient:**
- Read-only access would prevent appointment creation and management
- Without event creation capabilities, the primary business value proposition fails
- Google Meet integration requires event creation with conference data

**Code Evidence:**
```javascript
// From googleCalendarController.js - Line 200
const response = await calendar.events.insert({
  calendarId: user.googleCalendar.calendarId,
  resource: event
});

// From googleMeetService.js - Line 45
const response = await this.calendar.events.insert({
  calendarId: 'primary',
  resource: event,
  conferenceDataVersion: 1,
  sendUpdates: 'all'
});
```

### 3. `https://www.googleapis.com/auth/calendar.readonly` (RECOMMENDED)

**Why This Scope is Beneficial:**
- **Availability Checking**: Reading existing calendar events to prevent double-booking
- **Conflict Detection**: Ensuring appointments don't overlap with existing commitments
- **Business Intelligence**: Understanding calendar usage patterns for better scheduling

**Specific Use Cases:**
- Checking for conflicting events before scheduling appointments
- Reading existing events for availability analysis
- Providing scheduling suggestions based on calendar availability

**Why This Enhances User Experience:**
- Prevents scheduling conflicts automatically
- Provides better availability checking
- Enables smarter scheduling recommendations

**Code Evidence:**
```javascript
// From googleCalendarController.js - Line 280
const response = await calendar.events.list({
  calendarId: user.googleCalendar.calendarId,
  timeMin: new Date(startTime).toISOString(),
  timeMax: new Date(endTime).toISOString(),
  singleEvents: true,
  orderBy: 'startTime'
});
```

### 4. `https://www.googleapis.com/auth/userinfo.email` (RECOMMENDED)

**Why This Scope is Important:**
- **Event Attendees**: Adding customer email addresses to calendar events
- **Calendar Invitations**: Sending proper calendar invitations to customers
- **User Identification**: Properly identifying users for calendar event management

**Specific Use Cases:**
- Adding business owner's email as event organizer
- Including customer emails in appointment events
- Sending calendar invitations to appointment participants
- Proper event attribution and management

**Why This Improves Functionality:**
- Enables proper calendar invitation workflow
- Ensures events have correct attendee information
- Improves professional appearance of calendar events

**Code Evidence:**
```javascript
// From googleCalendarController.js - Line 210
attendees: [
  {
    email: user.email,
    displayName: user.businessName || user.name
  }
],
```

### 5. `https://www.googleapis.com/auth/userinfo.profile` (RECOMMENDED)

**Why This Scope Enhances User Experience:**
- **Event Personalization**: Using real names in calendar events instead of generic titles
- **Professional Presentation**: Displaying proper business/user names in appointments
- **User Interface**: Showing personalized information in the application

**Specific Use Cases:**
- Displaying user's real name in calendar events
- Personalizing appointment titles and descriptions
- Improving the professional appearance of scheduled appointments
- Better user identification in multi-user business scenarios

**Why This Adds Value:**
- Creates more professional-looking calendar events
- Improves user experience with personalized information
- Enables better business branding in calendar integration

## Business Justification Summary

**Tabi is a B2B SaaS application** serving businesses that need professional appointment scheduling and queue management. The requested scopes are essential for:

1. **Core Business Function**: Calendar-based appointment scheduling
2. **Professional Service Delivery**: Proper calendar integration with customer notifications
3. **Virtual Meeting Support**: Google Meet integration for remote appointments
4. **Conflict Prevention**: Availability checking to prevent double-booking
5. **Professional Presentation**: Proper event formatting with business information

**Why Limited Scopes Would Break Core Functionality:**
- Without `calendar` scope: Cannot access calendar metadata needed for timezone and settings management
- Without `calendar.events` scope: Cannot create appointments (core business function fails)
- Without `calendar.readonly`: Cannot check availability (leads to scheduling conflicts)
- Without `userinfo.email`: Cannot send proper calendar invitations to customers
- Without `userinfo.profile`: Events appear unprofessional with generic titles

**Target Users**: Small to medium businesses (medical offices, salons, consulting firms, government offices) who need professional appointment scheduling integrated with their existing Google Calendar workflows.

**Data Usage**: All calendar data is used solely for appointment scheduling and management. No data is shared with third parties or used for advertising purposes.
