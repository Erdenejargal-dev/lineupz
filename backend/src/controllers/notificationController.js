// ===== backend/src/controllers/notificationController.js =====
// SMS Notification Service for Queue and Appointment Updates

const User = require('../models/User');
const Line = require('../models/Line');
const LineJoiner = require('../models/LineJoiner');
const Appointment = require('../models/Appointment');

// Format phone number for Mongolia (+976)
const formatMongolianPhone = (phoneNumber) => {
  // Remove all non-digits
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // If it starts with 976, add +
  if (cleaned.startsWith('976')) {
    return '+' + cleaned;
  }
  
  // If it's 8 digits (local format), add +976
  if (cleaned.length === 8) {
    return '+976' + cleaned;
  }
  
  // If it already has +976, return as is
  if (phoneNumber.startsWith('+976')) {
    return phoneNumber;
  }
  
  // Default: assume it's a local number and add +976
  return '+976' + cleaned;
};

// SMS service with Android SMS Gateway
const sendSMS = async (phoneNumber, message) => {
  try {
    // Format phone number for Mongolia
    const formattedPhone = formatMongolianPhone(phoneNumber);
    
    // Always log for debugging
    console.log(`📱 SMS to ${formattedPhone}: ${message}`);
    
    // Check if Android SMS Gateway is configured
    if (process.env.SMS_GATEWAY_URL) {
      const response = await fetch(process.env.SMS_GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${process.env.SMS_GATEWAY_LOGIN}:${process.env.SMS_GATEWAY_PASSWORD}`).toString('base64')}`
        },
        body: JSON.stringify({
          textMessage: {
            text: message
          },
          phoneNumbers: [formattedPhone]
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ SMS sent successfully to ${formattedPhone}`);
        return { success: true, message: 'SMS sent successfully via Android Gateway', messageId: result.id };
      } else {
        const error = await response.text();
        console.error(`❌ SMS failed to ${formattedPhone}:`, error);
        return { success: false, error: `Gateway error: ${error}` };
      }
    } else {
      // Development mode - just log
      console.log(`🔧 Development mode: SMS would be sent to ${formattedPhone}`);
      return { success: true, message: 'SMS logged (development mode)' };
    }
    
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Queue Notifications
const notifyQueueUpdate = async (lineJoinerId, type, additionalData = {}) => {
  try {
    const lineJoiner = await LineJoiner.findById(lineJoinerId)
      .populate('user', 'phone name')
      .populate('line', 'title lineCode');
    
    if (!lineJoiner || !lineJoiner.user?.phone) {
      return { success: false, message: 'User or phone number not found' };
    }

    const { user, line } = lineJoiner;
    let message = '';

    switch (type) {
      case 'joined':
        message = `🎯 You've joined ${line.title}! Your position: #${lineJoiner.position}. Est. wait: ${lineJoiner.estimatedWaitTime}min. Code: ${line.lineCode}`;
        break;
        
      case 'position_update':
        message = `📍 Queue update for ${line.title}: You're now #${lineJoiner.position}. Est. wait: ${lineJoiner.estimatedWaitTime}min.`;
        break;
        
      case 'almost_ready':
        message = `⏰ Almost your turn at ${line.title}! You're #${lineJoiner.position} in line. Please be ready!`;
        break;
        
      case 'ready':
        message = `🔔 It's your turn at ${line.title}! Please proceed to the service area. Code: ${line.lineCode}`;
        break;
        
      case 'removed':
        message = `❌ You've been removed from ${line.title} queue. Reason: ${additionalData.reason || 'No longer needed'}`;
        break;
        
      default:
        message = `📢 Update for ${line.title}: ${additionalData.customMessage || 'Status changed'}`;
    }

    return await sendSMS(user.phone, message);
    
  } catch (error) {
    console.error('Queue notification error:', error);
    return { success: false, error: error.message };
  }
};

// Appointment Notifications
const notifyAppointmentUpdate = async (appointmentId, type, additionalData = {}) => {
  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate('user', 'phone name')
      .populate('line', 'title lineCode');
    
    if (!appointment || !appointment.user?.phone) {
      return { success: false, message: 'Appointment or phone number not found' };
    }

    const { user, line } = appointment;
    const appointmentTime = new Date(appointment.appointmentTime).toLocaleString();
    let message = '';

    switch (type) {
      case 'confirmed':
        message = `✅ Appointment confirmed at ${line.title}! Date: ${appointmentTime}. Duration: ${appointment.duration}min. Code: ${line.lineCode}`;
        break;
        
      case 'reminder_24h':
        message = `📅 Reminder: You have an appointment at ${line.title} tomorrow at ${appointmentTime}. Duration: ${appointment.duration}min.`;
        break;
        
      case 'reminder_1h':
        message = `⏰ Your appointment at ${line.title} is in 1 hour! Time: ${appointmentTime}. Please arrive on time.`;
        break;
        
      case 'cancelled':
        message = `❌ Your appointment at ${line.title} on ${appointmentTime} has been cancelled. Reason: ${additionalData.reason || 'Cancelled by business'}`;
        break;
        
      case 'rescheduled':
        const newTime = new Date(additionalData.newTime).toLocaleString();
        message = `📝 Your appointment at ${line.title} has been rescheduled from ${appointmentTime} to ${newTime}.`;
        break;
        
      default:
        message = `📢 Appointment update for ${line.title}: ${additionalData.customMessage || 'Status changed'}`;
    }

    return await sendSMS(user.phone, message);
    
  } catch (error) {
    console.error('Appointment notification error:', error);
    return { success: false, error: error.message };
  }
};

// Restaurant-specific notifications (for hybrid lines)
const notifyRestaurantUpdate = async (lineJoinerId, type, additionalData = {}) => {
  try {
    const lineJoiner = await LineJoiner.findById(lineJoinerId)
      .populate('user', 'phone name')
      .populate('line', 'title lineCode');
    
    if (!lineJoiner || !lineJoiner.user?.phone) {
      return { success: false, message: 'User or phone number not found' };
    }

    const { user, line } = lineJoiner;
    let message = '';

    switch (type) {
      case 'table_ready':
        message = `🍽️ Your table is ready at ${line.title}! Please proceed to the host stand. Party size: ${additionalData.partySize || 'N/A'}`;
        break;
        
      case 'table_assigned':
        message = `📍 Table assigned at ${line.title}! Table #${additionalData.tableNumber}. Please follow your server.`;
        break;
        
      case 'wait_estimate':
        message = `⏱️ Wait time update for ${line.title}: Approximately ${additionalData.waitTime} minutes for your party of ${additionalData.partySize || 'N/A'}.`;
        break;
        
      case 'reservation_confirmed':
        const reservationTime = new Date(additionalData.reservationTime).toLocaleString();
        message = `🎉 Reservation confirmed at ${line.title}! Date: ${reservationTime}. Party size: ${additionalData.partySize}. Please arrive on time.`;
        break;
        
      default:
        return await notifyQueueUpdate(lineJoinerId, type, additionalData);
    }

    return await sendSMS(user.phone, message);
    
  } catch (error) {
    console.error('Restaurant notification error:', error);
    return { success: false, error: error.message };
  }
};

// Bulk notifications for line updates
const notifyAllInLine = async (lineId, message, excludeUserId = null) => {
  try {
    const lineJoiners = await LineJoiner.find({
      line: lineId,
      status: 'waiting',
      ...(excludeUserId && { user: { $ne: excludeUserId } })
    }).populate('user', 'phone name');

    const results = [];
    
    for (const joiner of lineJoiners) {
      if (joiner.user?.phone) {
        const result = await sendSMS(joiner.user.phone, message);
        results.push({
          userId: joiner.user._id,
          phone: joiner.user.phone,
          success: result.success
        });
      }
    }

    return {
      success: true,
      totalSent: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
      results
    };
    
  } catch (error) {
    console.error('Bulk notification error:', error);
    return { success: false, error: error.message };
  }
};

// Test notification endpoint
const sendTestNotification = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required'
      });
    }

    const result = await sendSMS(phoneNumber, message);
    
    res.json({
      success: result.success,
      message: result.success ? 'Test SMS sent successfully' : 'Failed to send SMS',
      error: result.error
    });
    
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification'
    });
  }
};

// Get notification settings for a line
const getNotificationSettings = async (req, res) => {
  try {
    const { lineId } = req.params;
    
    const line = await Line.findOne({
      _id: lineId,
      creator: req.userId
    });

    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Line not found'
      });
    }

    // Default notification settings
    const settings = line.notificationSettings || {
      queueUpdates: true,
      positionUpdates: true,
      readyNotifications: true,
      appointmentReminders: true,
      cancellationNotices: true,
      customMessages: true
    };

    res.json({
      success: true,
      settings
    });
    
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification settings'
    });
  }
};

// Update notification settings for a line
const updateNotificationSettings = async (req, res) => {
  try {
    const { lineId } = req.params;
    const { settings } = req.body;
    
    const line = await Line.findOne({
      _id: lineId,
      creator: req.userId
    });

    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Line not found'
      });
    }

    line.notificationSettings = {
      ...line.notificationSettings,
      ...settings
    };

    await line.save();

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      settings: line.notificationSettings
    });
    
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification settings'
    });
  }
};

module.exports = {
  notifyQueueUpdate,
  notifyAppointmentUpdate,
  notifyRestaurantUpdate,
  notifyAllInLine,
  sendTestNotification,
  getNotificationSettings,
  updateNotificationSettings,
  // Export SMS functions for OTP
  sendSMS,
  formatMongolianPhone
};
