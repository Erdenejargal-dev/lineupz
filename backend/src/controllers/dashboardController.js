const Line = require('../models/Line');
const LineJoiner = require('../models/LineJoiner');
const User = require('../models/User');

// Get creator dashboard overview
const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user info and ensure they're a creator
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get total stats
    const [totalLines, activeLines, totalServed, totalInQueue] = await Promise.all([
      Line.countDocuments({ creator: userId }),
      Line.countDocuments({ creator: userId, isActive: true, 'availability.isActive': true }),
      LineJoiner.countDocuments({ 
        line: { $in: await Line.find({ creator: userId }).distinct('_id') },
        status: 'visited' 
      }),
      LineJoiner.countDocuments({ 
        line: { $in: await Line.find({ creator: userId }).distinct('_id') },
        status: 'waiting' 
      })
    ]);

    // Get recent lines with queue info
    const recentLines = await Line.find({ 
      creator: userId, 
      isActive: true 
    })
    .sort({ updatedAt: -1 })
    .limit(5);

    const linesWithStats = await Promise.all(
      recentLines.map(async (line) => {
        try {
          const [queueCount, servedToday] = await Promise.all([
            LineJoiner.countDocuments({ line: line._id, status: 'waiting' }),
            LineJoiner.countDocuments({ 
              line: line._id, 
              status: 'visited',
              visitedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            })
          ]);

          // Safely get estimated wait time
          let estimatedWaitTime = 0;
          try {
            estimatedWaitTime = await line.getEstimatedWaitTime();
          } catch (err) {
            // Fallback calculation
            estimatedWaitTime = queueCount * (line.settings?.estimatedServiceTime || 5);
          }

          // Safely check if currently available
          let isCurrentlyAvailable = false;
          try {
            isCurrentlyAvailable = line.isCurrentlyAvailable();
          } catch (err) {
            // Fallback - just check if active
            isCurrentlyAvailable = line.availability?.isActive || false;
          }

          return {
            _id: line._id,
            title: line.title,
            lineCode: line.lineCode,
            isActive: line.availability?.isActive || false,
            currentQueue: queueCount,
            servedToday,
            estimatedWaitTime,
            isCurrentlyAvailable,
            createdAt: line.createdAt
          };
        } catch (lineError) {
          console.error('Error processing line in dashboard:', line._id, lineError);
          // Return basic line info if there's an error
          return {
            _id: line._id,
            title: line.title,
            lineCode: line.lineCode,
            isActive: false,
            currentQueue: 0,
            servedToday: 0,
            estimatedWaitTime: 0,
            isCurrentlyAvailable: false,
            createdAt: line.createdAt
          };
        }
      })
    );

    // Get today's activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [todayJoined, todayServed] = await Promise.all([
      LineJoiner.countDocuments({
        line: { $in: await Line.find({ creator: userId }).distinct('_id') },
        joinedAt: { $gte: today }
      }),
      LineJoiner.countDocuments({
        line: { $in: await Line.find({ creator: userId }).distinct('_id') },
        status: 'visited',
        visitedAt: { $gte: today }
      })
    ]);

    res.json({
      success: true,
      dashboard: {
        user: {
          userId: user.userId,
          name: user.name,
          businessName: user.businessName,
          isCreator: user.isCreator
        },
        stats: {
          totalLines,
          activeLines,
          totalServed,
          totalInQueue,
          todayJoined,
          todayServed
        },
        recentLines: linesWithStats
      }
    });

  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data'
    });
  }
};

// Get detailed analytics for creator
const getAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const { period = '7d' } = req.query; // 7d, 30d, 90d

    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const userLines = await Line.find({ creator: userId }).distinct('_id');

    // Get analytics data
    const [joinedData, servedData, avgWaitTimes] = await Promise.all([
      // People who joined per day
      LineJoiner.aggregate([
        {
          $match: {
            line: { $in: userLines },
            joinedAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$joinedAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // People served per day
      LineJoiner.aggregate([
        {
          $match: {
            line: { $in: userLines },
            status: 'visited',
            visitedAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$visitedAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Average wait times
      LineJoiner.aggregate([
        {
          $match: {
            line: { $in: userLines },
            status: 'visited',
            actualWaitTime: { $exists: true },
            visitedAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$visitedAt" } },
            avgWaitTime: { $avg: "$actualWaitTime" }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Get line performance
    const linePerformance = await Promise.all(
      (await Line.find({ creator: userId, isActive: true })).map(async (line) => {
        const [totalJoined, totalServed, avgWaitTime] = await Promise.all([
          LineJoiner.countDocuments({ 
            line: line._id,
            joinedAt: { $gte: startDate }
          }),
          LineJoiner.countDocuments({ 
            line: line._id,
            status: 'visited',
            visitedAt: { $gte: startDate }
          }),
          LineJoiner.aggregate([
            {
              $match: {
                line: line._id,
                status: 'visited',
                actualWaitTime: { $exists: true },
                visitedAt: { $gte: startDate }
              }
            },
            {
              $group: {
                _id: null,
                avgWaitTime: { $avg: "$actualWaitTime" }
              }
            }
          ])
        ]);

        return {
          lineId: line._id,
          title: line.title,
          lineCode: line.lineCode,
          totalJoined,
          totalServed,
          avgWaitTime: avgWaitTime[0]?.avgWaitTime || 0,
          conversionRate: totalJoined > 0 ? (totalServed / totalJoined * 100) : 0
        };
      })
    );

    res.json({
      success: true,
      analytics: {
        period,
        chartData: {
          joined: joinedData,
          served: servedData,
          waitTimes: avgWaitTimes
        },
        linePerformance
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics data'
    });
  }
};

// Setup creator profile (business info)
const setupCreatorProfile = async (req, res) => {
  try {
    const { businessName, businessDescription } = req.body;

    if (!businessName) {
      return res.status(400).json({
        success: false,
        message: 'Business name is required'
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.businessName = businessName;
    user.businessDescription = businessDescription || '';
    user.isCreator = true;
    await user.save();

    res.json({
      success: true,
      message: 'Creator profile setup successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Setup creator profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup creator profile'
    });
  }
};

module.exports = {
  getDashboardOverview,
  getAnalytics,
  setupCreatorProfile
};
