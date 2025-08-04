// ===== backend/src/controllers/appointmentController.js =====
// Create this as a NEW FILE

const Appointment = require('../models/Appointment');
const Line = require('../models/Line');

// Make notification import optional to prevent errors
let notifyAppointmentUpdate;
try {
  const notificationController = require('./notificationController');
  notifyAppointmentUpdate = notificationController.notifyAppointmentUpdate;
} catch (error) {
  console.log('Notification controller not available, SMS notifications disabled');
  notifyAppointmentUpdate = null;
}

// Make Google Calendar import optional to prevent errors
let syncAppointmentToCalendar;
try {
  const googleCalendarController = require('./googleCalendarController');
  syncAppointmentToCalendar = googleCalendarController.syncAppointmentToCalendar;
} catch (error) {
  console.log('Google Calendar controller not available, calendar sync disabled');
  syncAppointmentToCalendar = null;
}

// Get available slots for a line on a specific date
const getAvailableSlots = async (req, res) => {
  try {
    console.log('=== GET AVAILABLE SLOTS REQUEST ===');
    console.log('Params:', req.params);
    console.log('Query:', req.query);
    console.log('Request headers:', req.headers);
    
    const { lineCode } = req.params;
    const { date } = req.query; // YYYY-MM-DD format
    
    console.log('Extracted lineCode:', lineCode);
    console.log('Extracted date:', date);
    
    if (!date) {
      console.log('ERROR: No date parameter provided');
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required (format: YYYY-MM-DD)'
      });
    }
    
    console.log(`Looking for line with code: ${lineCode}`);
    
    let line;
    try {
      line = await Line.findOne({ lineCode, isActive: true });
      console.log('Database query successful');
    } catch (dbError) {
      console.error('Database error when finding line:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database connection error'
      });
    }
    
    if (!line) {
      console.log('ERROR: Line not found or inactive');
      return res.status(404).json({
        success: false,
        message: 'Line not found'
      });
    }
    
    console.log(`Found line: ${line.title}, Service type: ${line.serviceType}`);
    
    if (line.serviceType === 'queue') {
      console.log('ERROR: Line is queue-only, not appointments');
      return res.status(400).json({
        success: false,
        message: 'This line does not support appointments'
      });
    }

    // Ensure appointment settings exist
    if (!line.appointmentSettings) {
      console.log('ERROR: Line missing appointment settings');
      return res.status(400).json({
        success: false,
        message: 'This line is not properly configured for appointments'
      });
    }
    
    console.log('Appointment settings:', line.appointmentSettings);
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      console.log('ERROR: Invalid date format:', date);
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Check if the requested date is within allowed booking window
    let requestedDate, today;
    try {
      requestedDate = new Date(date + 'T00:00:00.000Z'); // Ensure UTC
      today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      console.log(`Requested date: ${requestedDate.toISOString()}`);
      console.log(`Today: ${today.toISOString()}`);
    } catch (dateError) {
      console.error('Date parsing error:', dateError);
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    const maxAdvanceDays = line.appointmentSettings?.advanceBookingDays || 7;
    console.log(`Max advance days: ${maxAdvanceDays}`);
    
    // Handle fractional days (e.g., 0.04 for 1 hour)
    const maxAdvanceMilliseconds = maxAdvanceDays * 24 * 60 * 60 * 1000;
    const maxDate = new Date(today.getTime() + maxAdvanceMilliseconds);
    
    console.log(`Max booking date: ${maxDate.toISOString()}`);
    
    // Check if requested date is in the past
    if (requestedDate < today) {
      console.log('ERROR: Requested date is in the past');
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments for past dates'
      });
    }
    
    if (requestedDate > maxDate) {
      const advanceText = maxAdvanceDays < 1 ? 
        `${Math.round(maxAdvanceDays * 24)} hours` : 
        `${maxAdvanceDays} days`;
      
      console.log('ERROR: Requested date is too far in advance');
      return res.status(400).json({
        success: false,
        message: `Appointments can only be booked up to ${advanceText} in advance`
      });
    }
    
    // Get day of week
    let dayOfWeek;
    try {
      dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
      console.log(`Day of week: ${dayOfWeek}`);
    } catch (localeError) {
      console.error('Locale error:', localeError);
      // Fallback method
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      dayOfWeek = days[requestedDate.getDay()];
      console.log(`Day of week (fallback): ${dayOfWeek}`);
    }
    
    // Check if line has availability schedule
    if (!line.availability || !line.availability.schedule || !Array.isArray(line.availability.schedule)) {
      console.log('ERROR: Line missing availability schedule');
      return res.status(400).json({
        success: false,
        message: 'Line availability schedule not configured'
      });
    }
    
    console.log('Line schedule:', line.availability.schedule);
    
    // Find schedule for this day
    const daySchedule = line.availability.schedule.find(s => s.day === dayOfWeek);
    console.log(`Schedule for ${dayOfWeek}:`, daySchedule);
    
    if (!daySchedule || !daySchedule.isAvailable) {
      console.log(`No availability on ${dayOfWeek}`);
      return res.json({
        success: true,
        date,
        slots: [],
        message: 'No availability on this day'
      });
    }
    
    // Validate schedule times
    if (!daySchedule.startTime || !daySchedule.endTime) {
      console.log('ERROR: Invalid schedule times');
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule configuration'
      });
    }
    
    // Generate time slots
    const slots = [];
    const duration = line.appointmentSettings?.duration || 30;
    const interval = line.appointmentSettings?.slotInterval || 30;
    
    try {
      // Parse start and end times properly
      const [startHour, startMinute] = daySchedule.startTime.split(':').map(Number);
      const [endHour, endMinute] = daySchedule.endTime.split(':').map(Number);
      
      // Validate parsed times
      if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
        throw new Error('Invalid time format in schedule');
      }
      
      // Create start and end times for the specific date
      const startTime = new Date(date + 'T00:00:00.000Z');
      startTime.setUTCHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(date + 'T00:00:00.000Z');
      endTime.setUTCHours(endHour, endMinute, 0, 0);
      
      console.log(`Generating slots for ${date}:`);
      console.log(`Start time: ${startTime.toISOString()}`);
      console.log(`End time: ${endTime.toISOString()}`);
      console.log(`Duration: ${duration} minutes, Interval: ${interval} minutes`);
      
      let currentSlot = new Date(startTime);
      
      while (currentSlot < endTime) {
        const slotEnd = new Date(currentSlot.getTime() + duration * 60000);
        if (slotEnd <= endTime) {
          slots.push({
            startTime: new Date(currentSlot),
            endTime: new Date(slotEnd),
            available: true // Will be checked against existing appointments
          });
          console.log(`Generated slot: ${currentSlot.toISOString()} - ${slotEnd.toISOString()}`);
        }
        currentSlot = new Date(currentSlot.getTime() + interval * 60000);
      }
      
      console.log(`Total slots generated: ${slots.length}`);
    } catch (timeError) {
      console.error('Time parsing error:', timeError);
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule time format'
      });
    }
    
    // Get existing appointments for this date
    let existingAppointments = [];
    try {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      
      existingAppointments = await Appointment.find({
        line: line._id,
        appointmentTime: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: { $in: ['confirmed', 'pending', 'in_progress'] }
      });
      
      console.log(`Found ${existingAppointments.length} existing appointments`);
    } catch (appointmentError) {
      console.error('Error fetching existing appointments:', appointmentError);
      // Continue without existing appointments check
    }
    
    // Mark slots as unavailable if they conflict with existing appointments
    const availableSlots = slots.map(slot => {
      const isConflict = existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.appointmentTime);
        const appointmentEnd = new Date(appointment.endTime);
        
        return (slot.startTime < appointmentEnd && slot.endTime > appointmentStart);
      });
      
      return {
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        available: !isConflict
      };
    });
    
    console.log(`Returning ${availableSlots.length} slots, ${availableSlots.filter(s => s.available).length} available`);
    
    res.json({
      success: true,
      date,
      slots: availableSlots,
      totalSlots: availableSlots.length,
      availableSlots: availableSlots.filter(s => s.available).length
    });
    
  } catch (error) {
    console.error('Get available slots error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to get available slots',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Book an appointment
const bookAppointment = async (req, res) => {
  try {
    console.log('=== BOOK APPOINTMENT REQUEST ===');
    console.log('Request body:', req.body);
    console.log('User ID:', req.userId);
    
    const { lineCode, appointmentTime, notes, meetingType } = req.body;
    
    if (!lineCode || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Line code and appointment time are required'
      });
    }
    
    const line = await Line.findOne({ lineCode, isActive: true });
    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Line not found'
      });
    }
    
    console.log('Found line:', line.title, 'Service type:', line.serviceType);
    
    if (line.serviceType === 'queue') {
      return res.status(400).json({
        success: false,
        message: 'This line does not support appointments'
      });
    }
    
    const startTime = new Date(appointmentTime);
    const duration = line.appointmentSettings?.duration || 30;
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    console.log('Appointment time:', startTime.toISOString());
    console.log('Duration:', duration, 'minutes');
    console.log('End time:', endTime.toISOString());
    
    // Check if user already has an appointment for this line
    const existingAppointment = await Appointment.findOne({
      line: line._id,
      user: req.userId,
      status: { $in: ['confirmed', 'pending'] }
    });
    
    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'You already have an appointment for this line'
      });
    }
    
    // Check if slot is still available - improved overlap detection
    const conflictingAppointments = await Appointment.find({
      line: line._id,
      status: { $in: ['confirmed', 'pending', 'in_progress'] },
      $or: [
        // New appointment starts during existing appointment
        {
          appointmentTime: { $lte: startTime },
          endTime: { $gt: startTime }
        },
        // New appointment ends during existing appointment
        {
          appointmentTime: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        // New appointment completely contains existing appointment
        {
          appointmentTime: { $gte: startTime },
          endTime: { $lte: endTime }
        },
        // Existing appointment completely contains new appointment
        {
          appointmentTime: { $lte: startTime },
          endTime: { $gte: endTime }
        }
      ]
    });
    
    if (conflictingAppointments.length > 0) {
      console.log(`Booking conflict detected for ${startTime.toISOString()} - ${endTime.toISOString()}`);
      console.log('Conflicting appointments:', conflictingAppointments.map(apt => ({
        start: apt.appointmentTime.toISOString(),
        end: apt.endTime.toISOString()
      })));
      
      return res.status(409).json({
        success: false,
        message: 'This time slot is no longer available due to overlapping appointments'
      });
    }
    
    // Determine meeting type
    let finalMeetingType = meetingType;
    if (!finalMeetingType) {
      // Default based on line settings
      const lineMeetingType = line.appointmentSettings?.meetingType || 'in-person';
      if (lineMeetingType === 'both') {
        finalMeetingType = 'in-person'; // Default to in-person if both options available
      } else {
        finalMeetingType = lineMeetingType;
      }
    }
    
    console.log('Meeting type:', finalMeetingType);
    
    // Prepare appointment data
    const appointmentData = {
      line: line._id,
      user: req.userId,
      appointmentTime: startTime,
      endTime: endTime,
      duration: duration,
      status: line.appointmentSettings?.autoConfirm ? 'confirmed' : 'pending',
      notes: notes || '',
      meetingType: finalMeetingType
    };
    
    // Add location details for in-person meetings
    if (finalMeetingType === 'in-person') {
      appointmentData.location = {
        address: line.appointmentSettings?.location?.address || '',
        instructions: line.appointmentSettings?.location?.instructions || ''
      };
    }
    
    // Add online meeting details for online meetings
    if (finalMeetingType === 'online') {
      appointmentData.onlineMeeting = {
        platform: line.appointmentSettings?.onlineSettings?.platform || 'google-meet',
        meetingUrl: '', // Will be populated by Google Meet service
        meetingId: '',
        instructions: line.appointmentSettings?.onlineSettings?.meetingInstructions || ''
      };
    }
    
    console.log('Creating appointment with data:', appointmentData);
    
    // Create appointment
    const appointment = new Appointment(appointmentData);
    
    await appointment.save();
    await appointment.populate(['line', 'user']);
    
    // Send email notifications to both creator and customer
    try {
      const User = require('../models/User');
      const emailService = require('../services/emailService');
      
      // Get line creator
      const lineCreator = await User.findById(line.creator);
      const customer = appointment.user;
      
      console.log('Sending appointment confirmation emails...');
      
      // Email to customer
      if (customer && customer.email) {
        const customerEmailData = {
          to: customer.email,
          subject: `Appointment Confirmed - ${line.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">Appointment Confirmed! 🎉</h1>
              </div>
              
              <div style="padding: 30px; background: #f8f9fa;">
                <h2 style="color: #333; margin-bottom: 20px;">Your appointment has been booked</h2>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
                  <h3 style="color: #667eea; margin-top: 0;">${line.title}</h3>
                  <p style="color: #666; margin: 5px 0;"><strong>Code:</strong> ${line.lineCode}</p>
                  ${line.description ? `<p style="color: #666; margin: 5px 0;">${line.description}</p>` : ''}
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h4 style="color: #333; margin-top: 0;">📅 Appointment Details</h4>
                  <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${new Date(appointment.appointmentTime).toLocaleString()}</p>
                  <p style="margin: 5px 0;"><strong>Duration:</strong> ${appointment.duration} minutes</p>
                  <p style="margin: 5px 0;"><strong>Status:</strong> ${appointment.status}</p>
                  ${appointment.notes ? `<p style="margin: 5px 0;"><strong>Your Notes:</strong> ${appointment.notes}</p>` : ''}
                </div>
                
                ${finalMeetingType === 'in-person' ? `
                  <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="color: #2d5a2d; margin-top: 0;">📍 In-Person Meeting</h4>
                    ${appointmentData.location?.address ? `<p style="margin: 5px 0;"><strong>Address:</strong> ${appointmentData.location.address}</p>` : ''}
                    ${appointmentData.location?.instructions ? `<p style="margin: 5px 0;"><strong>Instructions:</strong> ${appointmentData.location.instructions}</p>` : ''}
                  </div>
                ` : ''}
                
                ${finalMeetingType === 'online' ? `
                  <div style="background: #f0e8ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="color: #6b46c1; margin-top: 0;">💻 Online Meeting</h4>
                    <p style="margin: 5px 0;"><strong>Platform:</strong> ${appointmentData.onlineMeeting?.platform || 'Google Meet'}</p>
                    <p style="margin: 5px 0;">Meeting link will be sent closer to the appointment time.</p>
                    ${appointmentData.onlineMeeting?.instructions ? `<p style="margin: 5px 0;"><strong>Instructions:</strong> ${appointmentData.onlineMeeting.instructions}</p>` : ''}
                  </div>
                ` : ''}
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://tabi.mn/dashboard" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View My Appointments</a>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
                  Need to cancel or reschedule? Visit your dashboard or contact the service provider.
                </p>
              </div>
              
              <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
                <p style="margin: 0;">This email was sent by <strong>Tabi</strong> - Smart Queue & Appointment Management</p>
                <p style="margin: 5px 0 0 0;">Visit us at <a href="https://tabi.mn" style="color: #667eea;">tabi.mn</a></p>
              </div>
            </div>
          `
        };
        
        await emailService.sendEmail(customerEmailData);
        console.log('Customer confirmation email sent successfully');
      }
      
      // Email to creator
      if (lineCreator && lineCreator.email) {
        const creatorEmailData = {
          to: lineCreator.email,
          subject: `New Appointment Booked - ${line.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">New Appointment Booked! 📅</h1>
              </div>
              
              <div style="padding: 30px; background: #f8f9fa;">
                <h2 style="color: #333; margin-bottom: 20px;">You have a new appointment</h2>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
                  <h3 style="color: #667eea; margin-top: 0;">${line.title}</h3>
                  <p style="color: #666; margin: 5px 0;"><strong>Code:</strong> ${line.lineCode}</p>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h4 style="color: #333; margin-top: 0;">👤 Customer Details</h4>
                  <p style="margin: 5px 0;"><strong>Name:</strong> ${customer.name || 'Not provided'}</p>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${customer.email || 'Not provided'}</p>
                  ${customer.phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${customer.phone}</p>` : ''}
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                  <h4 style="color: #333; margin-top: 0;">📅 Appointment Details</h4>
                  <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${new Date(appointment.appointmentTime).toLocaleString()}</p>
                  <p style="margin: 5px 0;"><strong>Duration:</strong> ${appointment.duration} minutes</p>
                  <p style="margin: 5px 0;"><strong>Meeting Type:</strong> ${finalMeetingType}</p>
                  <p style="margin: 5px 0;"><strong>Status:</strong> ${appointment.status}</p>
                  ${appointment.notes ? `<p style="margin: 5px 0;"><strong>Customer Notes:</strong> ${appointment.notes}</p>` : ''}
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://tabi.mn/creator-dashboard" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Manage Appointments</a>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
                  You can manage this appointment from your creator dashboard.
                </p>
              </div>
              
              <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
                <p style="margin: 0;">This email was sent by <strong>Tabi</strong> - Smart Queue & Appointment Management</p>
                <p style="margin: 5px 0 0 0;">Visit us at <a href="https://tabi.mn" style="color: #667eea;">tabi.mn</a></p>
              </div>
            </div>
          `
        };
        
        await emailService.sendEmail(creatorEmailData);
        console.log('Creator notification email sent successfully');
      }
      
    } catch (emailError) {
      console.error('Failed to send appointment emails:', emailError);
      // Don't fail the request if email fails
    }
    
    // Sync to Google Calendar if enabled
    if (syncAppointmentToCalendar) {
      try {
        // Get line creator for calendar sync
        const User = require('../models/User');
        const lineCreator = await User.findById(line.creator);
        
        if (lineCreator && lineCreator.googleCalendar?.connected && lineCreator.googleCalendar?.syncEnabled) {
          console.log('Syncing appointment to Google Calendar...');
          const syncResult = await syncAppointmentToCalendar(appointment, lineCreator);
          
          if (syncResult.success) {
            console.log('Appointment synced to Google Calendar successfully');
            // Optionally store the Google Calendar event ID
            appointment.googleCalendarEventId = syncResult.eventId;
            await appointment.save();
          } else {
            console.error('Failed to sync appointment to Google Calendar:', syncResult.message);
          }
        }
      } catch (calendarError) {
        console.error('Google Calendar sync error:', calendarError);
        // Don't fail the request if calendar sync fails
      }
    } else {
      console.log('Google Calendar sync disabled - syncAppointmentToCalendar not available');
    }
    
    // Send SMS notification for appointment confirmation
    if (notifyAppointmentUpdate) {
      try {
        await notifyAppointmentUpdate(appointment._id, 'confirmed');
      } catch (notificationError) {
        console.error('Failed to send appointment confirmation SMS:', notificationError);
        // Don't fail the request if notification fails
      }
    } else {
      console.log('SMS notifications disabled - notifyAppointmentUpdate not available');
    }
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      redirectTo: '/dashboard',
      appointment: {
        _id: appointment._id,
        appointmentTime: appointment.appointmentTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        status: appointment.status,
        notes: appointment.notes,
        meetingType: appointment.meetingType,
        location: appointment.location,
        onlineMeeting: appointment.onlineMeeting,
        line: {
          _id: appointment.line._id,
          title: appointment.line.title,
          lineCode: appointment.line.lineCode
        }
      }
    });
    
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment'
    });
  }
};

// Get user's appointments
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      user: req.userId,
      status: { $in: ['confirmed', 'pending', 'in_progress'] },
      appointmentTime: { $gte: new Date() } // Only future appointments
    })
    .populate('line', 'title description lineCode serviceType')
    .sort({ appointmentTime: 1 });
    
    res.json({
      success: true,
      appointments: appointments.map(appointment => ({
        _id: appointment._id,
        appointmentTime: appointment.appointmentTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        status: appointment.status,
        notes: appointment.notes,
        canCancel: appointment.canBeCancelled(),
        line: appointment.line
      }))
    });
    
  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments'
    });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;
    
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      user: req.userId
    }).populate('line');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    if (!appointment.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment cannot be cancelled (too close to appointment time)'
      });
    }
    
    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = reason || '';
    
    await appointment.save();
    
    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
    
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment'
    });
  }
};

// Get line appointments (for creator)
const getLineAppointments = async (req, res) => {
  try {
    const { lineId } = req.params;
    const { date, status } = req.query;
    
    // Verify line belongs to user
    const line = await Line.findOne({
      _id: lineId,
      creator: req.userId
    });
    
    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Line not found or access denied'
      });
    }
    
    let query = { line: lineId };
    
    // Filter by date if provided
    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      query.appointmentTime = { $gte: startOfDay, $lte: endOfDay };
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    const appointments = await Appointment.find(query)
      .populate('user', 'name phone userId')
      .sort({ appointmentTime: 1 });
    
    res.json({
      success: true,
      appointments: appointments.map(appointment => ({
        _id: appointment._id,
        appointmentTime: appointment.appointmentTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        status: appointment.status,
        notes: appointment.notes,
        user: appointment.user,
        createdAt: appointment.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Get line appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get line appointments'
    });
  }
};

// Mark appointment as completed
const markAppointmentCompleted = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const appointment = await Appointment.findById(appointmentId).populate('line');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Verify line belongs to user
    if (appointment.line.creator.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    appointment.status = 'completed';
    await appointment.save();
    
    res.json({
      success: true,
      message: 'Appointment marked as completed'
    });
    
  } catch (error) {
    console.error('Mark appointment completed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark appointment as completed'
    });
  }
};

module.exports = {
  getAvailableSlots,
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getLineAppointments,
  markAppointmentCompleted
};
