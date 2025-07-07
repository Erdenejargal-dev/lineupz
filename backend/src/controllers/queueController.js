const LineJoiner = require('../models/LineJoiner');
const Line = require('../models/Line');
const User = require('../models/User');

// Join a line using 6-digit code
const joinLine = async (req, res) => {
  try {
    const { lineCode } = req.body;

    if (!lineCode || lineCode.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Valid 6-digit line code is required'
      });
    }

    // Find user and line
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const line = await Line.findOne({ lineCode, isActive: true });
    if (!line) {
      return res.status(404).json({
        success: false,
        message: 'Line not found or inactive'
      });
    }

    // Check if line is currently available
    if (!line.isCurrentlyAvailable()) {
      return res.status(400).json({
        success: false,
        message: 'Line is not currently available'
      });
    }

    // Check if user is already in this line
    const existingEntry = await LineJoiner.findOne({
      user: req.userId,
      line: line._id,
      status: { $in: ['waiting', 'being_served'] }
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'Already in this line'
      });
    }

    // Check line capacity
    const currentCount = await LineJoiner.countDocuments({
      line: line._id,
      status: 'waiting'
    });
    
    if (currentCount >= line.settings.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Line is at maximum capacity'
      });
    }

    // Get next position manually
    const lastPosition = await LineJoiner.findOne({ line: line._id })
      .sort({ position: -1 });
    const nextPosition = lastPosition ? lastPosition.position + 1 : 1;

    // Calculate estimated wait time
    const estimatedWaitTime = await line.getEstimatedWaitTime();

    // Create new line joiner entry
    const lineJoiner = new LineJoiner({
      user: req.userId,
      line: line._id,
      position: nextPosition, // Explicitly set position
      estimatedWaitTime: estimatedWaitTime
    });

    await lineJoiner.save();

    // Update line stats
    await Line.findByIdAndUpdate(line._id, {
      $inc: { 'stats.totalJoined': 1 }
    });

    // Update user stats
    await User.findByIdAndUpdate(req.userId, {
      $inc: { totalTimesJoined: 1 }
    });

    // Populate line and user info for response
    await lineJoiner.populate([
      { path: 'line', select: 'title description creator settings' },
      { path: 'user', select: 'userId name' }
    ]);

    // Get current position in queue (people ahead + 1)
    const currentPosition = await LineJoiner.countDocuments({
      line: line._id,
      status: 'waiting',
      position: { $lt: nextPosition }
    }) + 1;

    res.status(201).json({
      success: true,
      message: 'Successfully joined the line',
      queueEntry: {
        _id: lineJoiner._id,
        line: lineJoiner.line,
        position: currentPosition,
        estimatedWaitTime,
        joinedAt: lineJoiner.joinedAt,
        status: lineJoiner.status
      }
    });

  } catch (error) {
    console.error('Join line error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join line'
    });
  }
};

// Get user's current queue positions
const getMyQueue = async (req, res) => {
  try {
    const queueEntries = await LineJoiner.find({
      user: req.userId,
      status: { $in: ['waiting', 'being_served'] }
    })
    .populate('line', 'title description lineCode creator settings')
    .sort({ joinedAt: -1 });

    // Add current position and wait time for each entry
    const enrichedEntries = await Promise.all(
      queueEntries.map(async (entry) => {
        const currentPosition = await LineJoiner.countDocuments({
          line: entry.line._id,
          status: 'waiting',
          position: { $lt: entry.position }
        }) + 1;
        
        const estimatedWaitTime = (currentPosition - 1) * entry.line.settings.estimatedServiceTime;
        
        return {
          _id: entry._id,
          line: entry.line,
          position: currentPosition,
          originalPosition: entry.position,
          estimatedWaitTime,
          joinedAt: entry.joinedAt,
          status: entry.status
        };
      })
    );

    res.json({
      success: true,
      queueEntries: enrichedEntries
    });

  } catch (error) {
    console.error('Get my queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue information'
    });
  }
};

// Get specific queue entry details
const getQueueEntry = async (req, res) => {
  try {
    const { entryId } = req.params;

    const queueEntry = await LineJoiner.findOne({
      _id: entryId,
      user: req.userId
    }).populate([
      { path: 'line', select: 'title description lineCode creator settings' },
      { path: 'user', select: 'userId name' }
    ]);

    if (!queueEntry) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found'
      });
    }

    const currentPosition = await LineJoiner.countDocuments({
      line: queueEntry.line._id,
      status: 'waiting',
      position: { $lt: queueEntry.position }
    }) + 1;

    const estimatedWaitTime = (currentPosition - 1) * queueEntry.line.settings.estimatedServiceTime;

    res.json({
      success: true,
      queueEntry: {
        _id: queueEntry._id,
        line: queueEntry.line,
        position: currentPosition,
        originalPosition: queueEntry.position,
        estimatedWaitTime,
        joinedAt: queueEntry.joinedAt,
        status: queueEntry.status,
        notes: queueEntry.notes
      }
    });

  } catch (error) {
    console.error('Get queue entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue entry'
    });
  }
};

// Leave a line (user decides to leave)
const leaveLine = async (req, res) => {
  try {
    const { entryId } = req.params;

    const queueEntry = await LineJoiner.findOne({
      _id: entryId,
      user: req.userId,
      status: { $in: ['waiting', 'being_served'] }
    });

    if (!queueEntry) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found or already completed'
      });
    }

    queueEntry.status = 'left';
    queueEntry.leftAt = new Date();
    await queueEntry.save();

    res.json({
      success: true,
      message: 'Successfully left the line'
    });

  } catch (error) {
    console.error('Leave line error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave line'
    });
  }
};

// ===== CREATOR QUEUE MANAGEMENT =====

// Get queue for a specific line (creator view)
const getLineQueue = async (req, res) => {
  try {
    const { lineId } = req.params;
    const { status = 'waiting' } = req.query;

    // Verify line belongs to creator
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

    const queue = await LineJoiner.find({ line: lineId, status })
      .populate('user', 'userId name')
      .sort({ position: 1 });

    // Add estimated wait time for each person
    const enrichedQueue = queue.map((entry, index) => {
      const estimatedWait = index * line.settings.estimatedServiceTime;
      return {
        _id: entry._id,
        userId: entry.user.userId,
        name: entry.user.name || 'Anonymous',
        position: entry.position,
        currentPosition: index + 1,
        joinedAt: entry.joinedAt,
        estimatedWaitTime: estimatedWait,
        status: entry.status,
        notes: entry.notes
      };
    });

    res.json({
      success: true,
      line: {
        _id: line._id,
        title: line.title,
        lineCode: line.lineCode
      },
      queue: enrichedQueue,
      totalInQueue: enrichedQueue.length
    });

  } catch (error) {
    console.error('Get line queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get line queue'
    });
  }
};

// Mark person as visited/served (creator action)
const markAsVisited = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { notes } = req.body;

    // Find the queue entry and verify the line belongs to the creator
    const queueEntry = await LineJoiner.findById(entryId)
      .populate({
        path: 'line',
        match: { creator: req.userId, isActive: true }
      });

    if (!queueEntry || !queueEntry.line) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found or you do not have access'
      });
    }

    if (queueEntry.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: 'Person is not in waiting status'
      });
    }

    queueEntry.status = 'visited';
    queueEntry.visitedAt = new Date();
    queueEntry.actualWaitTime = Math.round((queueEntry.visitedAt - queueEntry.joinedAt) / (1000 * 60)); // in minutes
    if (notes) queueEntry.notes = notes;
    
    await queueEntry.save();
    
    // Update line stats
    await Line.findByIdAndUpdate(queueEntry.line._id, {
      $inc: { 'stats.totalServed': 1 }
    });

    res.json({
      success: true,
      message: 'Person marked as visited successfully',
      queueEntry: {
        _id: queueEntry._id,
        status: queueEntry.status,
        visitedAt: queueEntry.visitedAt,
        actualWaitTime: queueEntry.actualWaitTime
      }
    });

  } catch (error) {
    console.error('Mark as visited error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark person as visited'
    });
  }
};

// Remove person from queue (creator action)
const removeFromQueue = async (req, res) => {
  try {
    const { entryId } = req.params;
    const { reason } = req.body;

    // Find the queue entry and verify the line belongs to the creator
    const queueEntry = await LineJoiner.findById(entryId)
      .populate({
        path: 'line',
        match: { creator: req.userId, isActive: true }
      });

    if (!queueEntry || !queueEntry.line) {
      return res.status(404).json({
        success: false,
        message: 'Queue entry not found or you do not have access'
      });
    }

    if (queueEntry.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: 'Person is not in waiting status'
      });
    }

    queueEntry.status = 'removed';
    queueEntry.leftAt = new Date();
    if (reason) queueEntry.notes = reason;
    await queueEntry.save();

    res.json({
      success: true,
      message: 'Person removed from queue successfully'
    });

  } catch (error) {
    console.error('Remove from queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove person from queue'
    });
  }
};

// Get queue statistics for creator
const getQueueStats = async (req, res) => {
  try {
    const { lineId } = req.params;

    // Verify line belongs to creator
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

    const [waiting, served, total] = await Promise.all([
      LineJoiner.countDocuments({ line: lineId, status: 'waiting' }),
      LineJoiner.countDocuments({ line: lineId, status: 'visited' }),
      LineJoiner.countDocuments({ line: lineId })
    ]);

    // Calculate average wait time
    const visitedEntries = await LineJoiner.find({ 
      line: lineId, 
      status: 'visited',
      actualWaitTime: { $exists: true }
    });

    const avgWaitTime = visitedEntries.length > 0 
      ? visitedEntries.reduce((sum, entry) => sum + entry.actualWaitTime, 0) / visitedEntries.length
      : 0;

    res.json({
      success: true,
      stats: {
        currentlyWaiting: waiting,
        totalServed: served,
        totalJoined: total,
        averageWaitTime: Math.round(avgWaitTime),
        estimatedWaitTime: await line.getEstimatedWaitTime()
      }
    });

  } catch (error) {
    console.error('Get queue stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue statistics'
    });
  }
};

module.exports = {
  // User queue actions
  joinLine,
  getMyQueue,
  getQueueEntry,
  leaveLine,
  
  // Creator queue management
  getLineQueue,
  markAsVisited,
  removeFromQueue,
  getQueueStats
};