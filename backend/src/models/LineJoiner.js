const mongoose = require('mongoose');

const lineJoinerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  line: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Line',
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'being_served', 'visited', 'left', 'removed'],
    default: 'waiting'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  visitedAt: {
    type: Date
  },
  leftAt: {
    type: Date
  },
  // Metadata
  estimatedWaitTime: {
    type: Number // in minutes when they joined
  },
  actualWaitTime: {
    type: Number // actual time waited
  },
  notes: {
    type: String,
    maxlength: 200
  }
}, {
  timestamps: true
});

// Compound index to ensure one person can't join the same line twice while waiting
lineJoinerSchema.index({ user: 1, line: 1, status: 1 });

// Auto-generate position before saving
lineJoinerSchema.pre('save', async function(next) {
  if (this.isNew && !this.position) {
    const lastPosition = await this.constructor
      .findOne({ line: this.line })
      .sort({ position: -1 });
    
    this.position = lastPosition ? lastPosition.position + 1 : 1;
  }
  next();
});

// Mark as visited
lineJoinerSchema.methods.markAsVisited = async function(notes = '') {
  this.status = 'visited';
  this.visitedAt = new Date();
  this.actualWaitTime = Math.round((this.visitedAt - this.joinedAt) / (1000 * 60)); // in minutes
  if (notes) this.notes = notes;
  
  await this.save();
  
  // Update line stats
  const Line = mongoose.model('Line');
  await Line.findByIdAndUpdate(this.line, {
    $inc: { 'stats.totalServed': 1 }
  });
  
  return this;
};

// Mark as left (user left voluntarily)
lineJoinerSchema.methods.markAsLeft = async function() {
  this.status = 'left';
  this.leftAt = new Date();
  await this.save();
  return this;
};

// Get user's current position in queue
lineJoinerSchema.methods.getCurrentPosition = async function() {
  const peopleAhead = await this.constructor.countDocuments({
    line: this.line,
    status: 'waiting',
    position: { $lt: this.position }
  });
  
  return peopleAhead + 1; // Current position (1-based)
};

// Get estimated wait time based on current position
lineJoinerSchema.methods.getEstimatedWaitTime = async function() {
  const currentPosition = await this.getCurrentPosition();
  const Line = mongoose.model('Line');
  const line = await Line.findById(this.line);
  
  return (currentPosition - 1) * line.settings.estimatedServiceTime;
};

// Static method to join a line
lineJoinerSchema.statics.joinLine = async function(userId, lineCode) {
  const User = mongoose.model('User');
  const Line = mongoose.model('Line');
  
  // Find user and line
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  const line = await Line.findOne({ lineCode, isActive: true });
  if (!line) {
    throw new Error('Line not found or inactive');
  }
  
  // Check if line is currently available
  if (!line.isCurrentlyAvailable()) {
    throw new Error('Line is not currently available');
  }
  
  // Check if user is already in this line
  const existingEntry = await this.findOne({
    user: userId,
    line: line._id,
    status: { $in: ['waiting', 'being_served'] }
  });
  
  if (existingEntry) {
    throw new Error('Already in this line');
  }
  
  // Check line capacity
  const currentCount = await line.getCurrentQueueCount();
  if (currentCount >= line.settings.maxCapacity) {
    throw new Error('Line is at maximum capacity');
  }
  
  // Create new line joiner entry
  const lineJoiner = new this({
    user: userId,
    line: line._id,
    estimatedWaitTime: await line.getEstimatedWaitTime()
  });
  
  await lineJoiner.save();
  
  // Update line stats
  await Line.findByIdAndUpdate(line._id, {
    $inc: { 'stats.totalJoined': 1 }
  });
  
  // Update user stats
  await User.findByIdAndUpdate(userId, {
    $inc: { totalTimesJoined: 1 }
  });
  
  return lineJoiner;
};

// Static method to get line queue
lineJoinerSchema.statics.getLineQueue = async function(lineId, status = 'waiting') {
  return await this.find({ line: lineId, status })
    .populate('user', 'userId name')
    .sort({ position: 1 });
};

// Auto-remove people who haven't been marked visited after timeout
lineJoinerSchema.statics.autoRemoveExpired = async function() {
  const Line = mongoose.model('Line');
  const lines = await Line.find({ isActive: true });
  
  for (const line of lines) {
    const timeoutMinutes = line.settings.autoRemoveAfterMinutes;
    const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    
    await this.updateMany({
      line: line._id,
      status: 'waiting',
      joinedAt: { $lt: cutoffTime }
    }, {
      status: 'removed',
      leftAt: new Date()
    });
  }
};

module.exports = mongoose.model('LineJoiner', lineJoinerSchema);