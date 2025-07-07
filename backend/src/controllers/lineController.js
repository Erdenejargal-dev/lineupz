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

// Create a new line
const createLine = async (req, res) => {
  try {
    const { title, description, codeType, maxCapacity, estimatedServiceTime, schedule } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Line title is required'
      });
    }

    // Create new line with manually generated code
    const line = new Line({
      creator: req.userId,
      title,
      description,
      codeType: codeType || 'stable',
      lineCode: await generateLineCode(), // Explicitly generate code
      settings: {
        maxCapacity: maxCapacity || 50,
        estimatedServiceTime: estimatedServiceTime || 5
      }
    });

    // Add schedule if provided
    if (schedule && Array.isArray(schedule)) {
      line.availability.schedule = schedule;
    }

    await line.save();

    // Update user stats
    await User.findByIdAndUpdate(req.userId, {
      $inc: { totalLinesCreated: 1 },
      isCreator: true
    });

    // Populate creator info for response
    await line.populate('creator', 'userId name businessName');

    res.status(201).json({
      success: true,
      message: 'Line created successfully',
      line
    });

  } catch (error) {
    console.error('Create line error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create line'
    });
  }
};

// Get line by code (for joining)
const getLineByCode = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code || code.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Valid 6-digit line code is required'
      });
    }

    const line = await Line.findOne({ 
      lineCode: code, 
      isActive: true 
    }).populate('creator', 'userId name businessName businessDescription');

    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Line not found or inactive'
      });
    }

    // Check if temporary code is expired
    if (line.codeType === 'temporary' && line.codeExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Line code has expired'
      });
    }

    // Get current queue info
    const queueCount = await line.getCurrentQueueCount();
    const estimatedWaitTime = await line.getEstimatedWaitTime();
    const isAvailable = line.isCurrentlyAvailable();

    // Check if user is already in this line (if authenticated)
    let userInLine = null;
    if (req.userId) {
      userInLine = await LineJoiner.findOne({
        user: req.userId,
        line: line._id,
        status: { $in: ['waiting', 'being_served'] }
      });
    }

    res.json({
      success: true,
      line: {
        _id: line._id,
        title: line.title,
        description: line.description,
        lineCode: line.lineCode,
        creator: line.creator.getPublicProfile(),
        settings: line.settings,
        isAvailable,
        queueCount,
        estimatedWaitTime,
        userInLine: userInLine ? {
          position: await userInLine.getCurrentPosition(),
          estimatedWait: await userInLine.getEstimatedWaitTime(),
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
        const queueCount = await line.getCurrentQueueCount();
        const estimatedWaitTime = await line.getEstimatedWaitTime();
        
        return {
          ...line.toObject(),
          queueCount,
          estimatedWaitTime,
          isAvailable: line.isCurrentlyAvailable()
        };
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
    const { title, description, maxCapacity, estimatedServiceTime, allowJoining, schedule } = req.body;

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
    if (allowJoining !== undefined) line.settings.allowJoining = allowJoining;
    if (schedule && Array.isArray(schedule)) line.availability.schedule = schedule;

    await line.save();

    res.json({
      success: true,
      message: 'Line updated successfully',
      line
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