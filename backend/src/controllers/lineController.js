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
      serviceType,           // NEW FIELD
      appointmentSettings,   // NEW FIELD
      schedule,              // NEW FIELD - from frontend
      codeType 
    } = req.body;

    // Validation
    if (!title || !maxCapacity || !estimatedServiceTime) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: title, maxCapacity, estimatedServiceTime'
      });
    }

    // Generate unique 6-digit code
    let lineCode;
    let isUnique = false;
    while (!isUnique) {
      lineCode = Math.floor(100000 + Math.random() * 900000).toString();
      const existingLine = await Line.findOne({ lineCode });
      if (!existingLine) isUnique = true;
    }

    // Prepare line data
    const lineData = {
      creator: req.userId,
      title,
      description,
      lineCode,
      serviceType: serviceType || 'queue',    // NEW: Default to queue
      settings: {
        maxCapacity,
        estimatedServiceTime
      },
      availability: {
        isActive: true,
        schedule: schedule || [
          { day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
          { day: 'saturday', startTime: '10:00', endTime: '16:00', isAvailable: false },
          { day: 'sunday', startTime: '10:00', endTime: '16:00', isAvailable: false }
        ]
      },
      codeType: codeType || 'stable'
    };

    // NEW: Add appointmentSettings for appointment/hybrid lines
    if (serviceType === 'appointments' || serviceType === 'hybrid') {
      lineData.appointmentSettings = appointmentSettings || {
        duration: 30,
        slotInterval: 30,
        advanceBookingDays: 7,
        bufferTime: 5,
        cancellationHours: 2,
        autoConfirm: true,
        maxConcurrentAppointments: 1
      };
    }

    const line = new Line(lineData);
    await line.save();

    // Update user to be a creator if not already
    await User.findByIdAndUpdate(req.userId, {
      isCreator: true,
      $inc: { totalLinesCreated: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Line created successfully',
      line: {
        _id: line._id,
        title: line.title,
        description: line.description,
        lineCode: line.lineCode,
        serviceType: line.serviceType,           // NEW
        appointmentSettings: line.appointmentSettings, // NEW
        settings: line.settings,
        availability: line.availability,
        isActive: line.isActive,
        createdAt: line.createdAt
      }
    });

  } catch (error) {
    console.error('Create line error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create line'
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
            isAvailable: line.isCurrentlyAvailable()
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

    // Get current queue
    const queue = await LineJoiner.getLineQueue(lineId, 'waiting');
    const queueCount = queue.length;
    const estimatedWaitTime = await line.getEstimatedWaitTime();

    res.json({
      success: true,
      line: {
        ...line.toObject(),
        queueCount,
        estimatedWaitTime,
        isAvailable: line.isCurrentlyAvailable(),
        queue: queue.map(joiner => ({
          _id: joiner._id,
          userId: joiner.user.userId,
          name: joiner.user.name || 'Anonymous',
          position: joiner.position,
          joinedAt: joiner.joinedAt,
          estimatedWaitTime: joiner.estimatedWaitTime
        }))
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
