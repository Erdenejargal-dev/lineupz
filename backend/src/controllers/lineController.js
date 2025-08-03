const Line = require('../models/Line');
const LineJoiner = require('../models/LineJoiner');
const User = require('../models/User');

// Generate unique 6-digit line code
const generateLineCode = async () => {
  let code;
  let exists = true;
  
  while (exists) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const existingLine = await Line.findOne({ lineCode: code });
    exists = !!existingLine;
  }
  
  return code;
};

const createLine = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      maxCapacity,
      estimatedServiceTime,
      serviceType,
      appointmentSettings,
      schedule,
      codeType 
    } = req.body;

    // Enhanced validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Line title is required and cannot be empty'
      });
    }

    if (title.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Line title cannot be more than 100 characters'
      });
    }

    if (description && description.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot be more than 500 characters'
      });
    }

    // Validate service type
    const validServiceTypes = ['queue', 'appointments', 'hybrid'];
    const finalServiceType = serviceType || 'queue';
    
    if (!validServiceTypes.includes(finalServiceType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service type. Must be queue, appointments, or hybrid'
      });
    }

    // Validate capacity and service time for queue/hybrid lines
    if (finalServiceType === 'queue' || finalServiceType === 'hybrid') {
      if (!maxCapacity || maxCapacity < 1 || maxCapacity > 200) {
        return res.status(400).json({
          success: false,
          message: 'Max capacity must be between 1 and 200 for queue-based lines'
        });
      }

      if (!estimatedServiceTime || estimatedServiceTime < 1 || estimatedServiceTime > 240) {
        return res.status(400).json({
          success: false,
          message: 'Estimated service time must be between 1 and 240 minutes for queue-based lines'
        });
      }
    }

    // Validate appointment settings for appointment/hybrid lines
    if (finalServiceType === 'appointments' || finalServiceType === 'hybrid') {
      if (appointmentSettings) {
        const { duration, slotInterval, advanceBookingDays, cancellationHours } = appointmentSettings;
        
        if (duration && (duration < 5 || duration > 480)) {
          return res.status(400).json({
            success: false,
            message: 'Appointment duration must be between 5 and 480 minutes'
          });
        }

        if (slotInterval && ![15, 30, 60].includes(slotInterval)) {
          return res.status(400).json({
            success: false,
            message: 'Slot interval must be 15, 30, or 60 minutes'
          });
        }


        if (cancellationHours && (cancellationHours < 0 || cancellationHours > 72)) {
          return res.status(400).json({
            success: false,
            message: 'Cancellation hours must be between 0 and 72'
          });
        }
      }
    }

    // Validate schedule if provided
    if (schedule && Array.isArray(schedule)) {
      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      for (const daySchedule of schedule) {
        if (!validDays.includes(daySchedule.day)) {
          return res.status(400).json({
            success: false,
            message: `Invalid day: ${daySchedule.day}`
          });
        }

        if (daySchedule.isAvailable) {
          if (!timeRegex.test(daySchedule.startTime) || !timeRegex.test(daySchedule.endTime)) {
            return res.status(400).json({
              success: false,
              message: 'Invalid time format. Use HH:MM format'
            });
          }

          // Check if end time is after start time
          const startMinutes = parseInt(daySchedule.startTime.split(':')[0]) * 60 + parseInt(daySchedule.startTime.split(':')[1]);
          const endMinutes = parseInt(daySchedule.endTime.split(':')[0]) * 60 + parseInt(daySchedule.endTime.split(':')[1]);
          
          if (endMinutes <= startMinutes) {
            return res.status(400).json({
              success: false,
              message: `End time must be after start time for ${daySchedule.day}`
            });
          }
        }
      }
    }

    // Generate unique 6-digit code
    const lineCode = await generateLineCode();

    // Prepare default schedule
    const defaultSchedule = [
      { day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
      { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false },
      { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false }
    ];

    // Prepare line data
    const lineData = {
      creator: req.userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      lineCode,
      serviceType: finalServiceType,
      availability: {
        isActive: true,
        schedule: schedule && Array.isArray(schedule) && schedule.length > 0 ? schedule : defaultSchedule
      },
      codeType: codeType || 'stable',
      isActive: true
    };

    // Add settings for queue/hybrid lines
    if (finalServiceType === 'queue' || finalServiceType === 'hybrid') {
      lineData.settings = {
        maxCapacity: parseInt(maxCapacity),
        estimatedServiceTime: parseInt(estimatedServiceTime)
      };
    }

    // Add appointment settings for appointment/hybrid lines
    if (finalServiceType === 'appointments' || finalServiceType === 'hybrid') {
      lineData.appointmentSettings = {
        duration: appointmentSettings?.duration || 30,
        slotInterval: appointmentSettings?.slotInterval || 30,
        advanceBookingDays: appointmentSettings?.advanceBookingDays || 7,
        bufferTime: appointmentSettings?.bufferTime || 5,
        cancellationHours: appointmentSettings?.cancellationHours || 2,
        autoConfirm: appointmentSettings?.autoConfirm !== false, // Default to true
        maxConcurrentAppointments: appointmentSettings?.maxConcurrentAppointments || 1
      };
    }

    // Create and save the line
    const line = new Line(lineData);
    await line.save();

    // Update user to be a creator if not already
    await User.findByIdAndUpdate(req.userId, {
      isCreator: true,
      $inc: { totalLinesCreated: 1 }
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Line created successfully',
      line: {
        _id: line._id,
        title: line.title,
        description: line.description,
        lineCode: line.lineCode,
        serviceType: line.serviceType,
        appointmentSettings: line.appointmentSettings,
        settings: line.settings,
        availability: line.availability,
        isActive: line.isActive,
        createdAt: line.createdAt
      }
    });

  } catch (error) {
    console.error('Create line error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A line with this code already exists. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create line. Please try again.'
    });
  }
};

const getLineByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code || code.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Invalid line code format'
      });
    }

    const line = await Line.findOne({ 
      lineCode: code, 
      isActive: true 
    }).populate('creator', 'name businessName');

    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Line not found or inactive'
      });
    }

    // Ensure serviceType exists (for backward compatibility)
    const serviceType = line.serviceType || 'queue';

    // Get current queue count for queue-based lines
    let queueCount = 0;
    if (serviceType === 'queue' || serviceType === 'hybrid') {
      queueCount = await LineJoiner.countDocuments({
        line: line._id,
        status: 'waiting'
      });
    }

    // Check if user is already in this line (if authenticated)
    let userInLine = null;
    if (req.userId) {
      if (serviceType === 'queue' || serviceType === 'hybrid') {
        userInLine = await LineJoiner.findOne({
          line: line._id,
          user: req.userId,
          status: 'waiting'
        });
      }
      
      // TODO: Also check for existing appointments
      // const userAppointment = await Appointment.findOne({
      //   line: line._id,
      //   user: req.userId,
      //   status: { $in: ['confirmed', 'pending'] }
      // });
    }

    // Calculate estimated wait time safely
    let estimatedWaitTime = 0;
    if (queueCount > 0) {
      estimatedWaitTime = queueCount * (line.settings?.estimatedServiceTime || 5);
    }

    // Safely check if currently available
    let isAvailable = false;
    try {
      isAvailable = line.isCurrentlyAvailable();
    } catch (err) {
      // Fallback - just check if active
      isAvailable = line.availability?.isActive || false;
    }

    res.json({
      success: true,
      line: {
        _id: line._id,
        title: line.title,
        description: line.description,
        lineCode: line.lineCode,
        serviceType: serviceType,                         // Ensure this exists
        appointmentSettings: line.appointmentSettings,   // May be undefined for old lines
        creator: line.creator,
        settings: line.settings,
        isAvailable: isAvailable,
        queueCount,
        estimatedWaitTime,
        userInLine: userInLine ? {
          _id: userInLine._id,
          position: userInLine.position,
          joinedAt: userInLine.joinedAt
        } : null
      }
    });

  } catch (error) {
    console.error('Get line by code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get line information'
    });
  }
};

// Get creator's lines
const getMyLines = async (req, res) => {
  try {
    const lines = await Line.find({ 
      creator: req.userId,
      isActive: true 
    }).sort({ createdAt: -1 });

    // Add queue info for each line
    const linesWithQueue = await Promise.all(
      lines.map(async (line) => {
        try {
          const queueCount = await line.getCurrentQueueCount();
          const estimatedWaitTime = await line.getEstimatedWaitTime();
          
          const lineObj = line.toObject();
          
          // Ensure serviceType exists (for backward compatibility)
          if (!lineObj.serviceType) {
            lineObj.serviceType = 'queue';
          }
          
          return {
            ...lineObj,
            queueCount,
            estimatedWaitTime,
            isAvailable: line.availability?.isActive || false
          };
        } catch (lineError) {
          console.error('Error processing line:', line._id, lineError);
          // Return basic line info if there's an error
          const lineObj = line.toObject();
          return {
            ...lineObj,
            serviceType: lineObj.serviceType || 'queue',
            queueCount: 0,
            estimatedWaitTime: 0,
            isAvailable: false
          };
        }
      })
    );

    res.json({
      success: true,
      lines: linesWithQueue
    });

  } catch (error) {
    console.error('Get my lines error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get lines'
    });
  }
};

// Get specific line details (for creator dashboard)
const getLineDetails = async (req, res) => {
  try {
    const { lineId } = req.params;

    const line = await Line.findOne({
      _id: lineId,
      creator: req.userId,
      isActive: true
    });

    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Line not found or you do not have access'
      });
    }

    const serviceType = line.serviceType || 'queue';
    let queue = [];
    let appointments = [];
    let queueCount = 0;
    let appointmentCount = 0;

    // Get current queue for queue-based or hybrid lines
    if (serviceType === 'queue' || serviceType === 'hybrid') {
      try {
        queue = await LineJoiner.getLineQueue(lineId, 'waiting');
        queueCount = queue.length;
      } catch (queueError) {
        console.error('Error getting queue:', queueError);
        queue = [];
        queueCount = 0;
      }
    }

    // Get appointments for appointment-based or hybrid lines
    if (serviceType === 'appointments' || serviceType === 'hybrid') {
      try {
        const Appointment = require('../models/Appointment');
        
        console.log(`DEBUG: Looking for appointments for line ${lineId} (${line.lineCode})`);
        
        // Get ALL appointments for this line (not just today's) for debugging
        const allAppointments = await Appointment.find({
          line: lineId,
          status: { $in: ['confirmed', 'pending', 'in_progress'] }
        })
        .populate('user', 'name phone userId')
        .sort({ appointmentTime: 1 });
        
        console.log(`DEBUG: Found ${allAppointments.length} total appointments for line ${line.lineCode}`);
        
        // Get today's and upcoming appointments
        const now = new Date();
        console.log(`DEBUG: Current time: ${now.toISOString()}`);
        
        // Set to start of today in UTC to include all appointments from today onwards
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        console.log(`DEBUG: Today start (UTC): ${today.toISOString()}`);
        
        // TEMPORARY: Show ALL appointments regardless of date for debugging
        console.log(`DEBUG: Showing ALL appointments for debugging (bypassing date filter)`);
        const upcomingAppointments = allAppointments; // Show everything
        
        // Original filtering logic (commented out for debugging)
        // const upcomingAppointments = allAppointments.filter(appointment => {
        //   const appointmentDate = new Date(appointment.appointmentTime);
        //   const isUpcoming = appointmentDate >= today;
        //   console.log(`DEBUG: Appointment ${appointment._id} at ${appointmentDate.toISOString()} - isUpcoming: ${isUpcoming}`);
        //   return isUpcoming;
        // });
        
        console.log(`DEBUG: Found ${upcomingAppointments.length} upcoming appointments for line ${line.lineCode}`);
        
        appointments = upcomingAppointments.map(appointment => ({
          _id: appointment._id,
          type: 'appointment',
          userId: appointment.user?.userId || 'Unknown',
          customerName: appointment.user?.name || 'Anonymous',
          customerPhone: appointment.user?.phone,
          appointmentTime: appointment.appointmentTime,
          endTime: appointment.endTime,
          duration: appointment.duration,
          status: appointment.status,
          customerMessage: appointment.notes || '', // Customer message/notes
          joinedAt: appointment.createdAt,
          formattedTime: appointment.appointmentTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          formattedDate: appointment.appointmentTime.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })
        }));

        appointmentCount = appointments.length;
        
        console.log(`DEBUG: Returning ${appointmentCount} appointments for display`);
      } catch (appointmentError) {
        console.error('Error getting appointments:', appointmentError);
        appointments = [];
        appointmentCount = 0;
      }
    }

    let estimatedWaitTime = 0;
    try {
      estimatedWaitTime = await line.getEstimatedWaitTime();
    } catch (waitTimeError) {
      console.error('Error calculating wait time:', waitTimeError);
      estimatedWaitTime = queueCount * (line.settings?.estimatedServiceTime || 5);
    }

    let isAvailable = false;
    try {
      isAvailable = line.isCurrentlyAvailable();
    } catch (availabilityError) {
      console.error('Error checking availability:', availabilityError);
      isAvailable = line.availability?.isActive || false;
    }

    res.json({
      success: true,
      line: {
        ...line.toObject(),
        queueCount,
        appointmentCount,
        totalCustomers: queueCount + appointmentCount,
        estimatedWaitTime,
        isAvailable,
        // Queue data (for queue/hybrid lines)
        queue: queue.map(joiner => ({
          _id: joiner._id,
          type: 'queue',
          userId: joiner.user.userId,
          name: joiner.user.name || 'Anonymous',
          position: joiner.position,
          joinedAt: joiner.joinedAt,
          estimatedWaitTime: joiner.estimatedWaitTime,
          notes: joiner.notes || '' // Queue notes if any
        })),
        // Appointment data (for appointment/hybrid lines)
        appointments: appointments,
        // Combined view for hybrid lines
        allCustomers: [
          ...queue.map(joiner => ({
            _id: joiner._id,
            type: 'queue',
            userId: joiner.user.userId,
            name: joiner.user.name || 'Anonymous',
            position: joiner.position,
            joinedAt: joiner.joinedAt,
            estimatedWaitTime: joiner.estimatedWaitTime,
            notes: joiner.notes || '',
            status: 'waiting'
          })),
          ...appointments
        ].sort((a, b) => {
          // Sort by appointment time for appointments, join time for queue
          const timeA = a.appointmentTime || a.joinedAt;
          const timeB = b.appointmentTime || b.joinedAt;
          return new Date(timeA) - new Date(timeB);
        })
      }
    });

  } catch (error) {
    console.error('Get line details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get line details'
    });
  }
};

// Update line settings
const updateLine = async (req, res) => {
  try {
    const { lineId } = req.params;
    const { title, description, maxCapacity, estimatedServiceTime, schedule } = req.body;

    const line = await Line.findOne({
      _id: lineId,
      creator: req.userId,
      isActive: true
    });

    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Line not found or you do not have access'
      });
    }

    // Update fields if provided
    if (title) line.title = title;
    if (description !== undefined) line.description = description;
    if (maxCapacity) line.settings.maxCapacity = maxCapacity;
    if (estimatedServiceTime) line.settings.estimatedServiceTime = estimatedServiceTime;
    if (schedule && Array.isArray(schedule)) line.availability.schedule = schedule;

    await line.save();

    res.json({
      success: true,
      message: 'Line updated successfully',
      line: line.toObject()
    });

  } catch (error) {
    console.error('Update line error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update line'
    });
  }
};

// Regenerate line code
const regenerateCode = async (req, res) => {
  try {
    const { lineId } = req.params;

    const line = await Line.findOne({
      _id: lineId,
      creator: req.userId,
      isActive: true
    });

    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Line not found or you do not have access'
      });
    }

    // Generate new code manually
    const newCode = await generateLineCode();
    line.lineCode = newCode;
    
    if (line.codeType === 'temporary') {
      line.codeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    
    await line.save();

    res.json({
      success: true,
      message: 'Line code regenerated successfully',
      newCode
    });

  } catch (error) {
    console.error('Regenerate code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate code'
    });
  }
};

// Toggle line availability
const toggleAvailability = async (req, res) => {
  try {
    const { lineId } = req.params;

    const line = await Line.findOne({
      _id: lineId,
      creator: req.userId,
      isActive: true
    });

    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Line not found or you do not have access'
      });
    }

    line.availability.isActive = !line.availability.isActive;
    await line.save();

    res.json({
      success: true,
      message: `Line ${line.availability.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: line.availability.isActive
    });

  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle line availability'
    });
  }
};

// Delete/deactivate line
const deleteLine = async (req, res) => {
  try {
    const { lineId } = req.params;

    const line = await Line.findOne({
      _id: lineId,
      creator: req.userId,
      isActive: true
    });

    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Line not found or you do not have access'
      });
    }

    // Soft delete - mark as inactive instead of removing
    line.isActive = false;
    await line.save();

    // Mark all waiting line joiners as removed
    await LineJoiner.updateMany({
      line: lineId,
      status: 'waiting'
    }, {
      status: 'removed',
      leftAt: new Date()
    });

    res.json({
      success: true,
      message: 'Line deleted successfully'
    });

  } catch (error) {
    console.error('Delete line error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete line'
    });
  }
};

module.exports = {
  createLine,
  getLineByCode,
  getMyLines,
  getLineDetails,
  updateLine,
  regenerateCode,
  toggleAvailability,
  deleteLine
};
