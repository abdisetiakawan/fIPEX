const express = require('express');
const { db } = require('../config/firebase');
const { verifyToken, adminOnly } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');

const router = express.Router();

// Apply auth middleware to all panitia routes
router.use(verifyToken);
router.use(adminOnly);

// Get all sessions
router.get('/sessions', generalLimiter, asyncHandler(async (req, res) => {
  const sessionsSnapshot = await db
    .collection('sessions')
    .orderBy('createdAt', 'desc')
    .get();

  const sessions = [];
  sessionsSnapshot.forEach(doc => {
    sessions.push({ id: doc.id, ...doc.data() });
  });

  res.json({
    success: true,
    data: { sessions }
  });
}));

// Create new session
router.post('/sessions', generalLimiter, asyncHandler(async (req, res) => {
  const {
    title,
    description,
    type,
    startDate,
    endDate,
    sendNotification = true,
    targetRoles = ['mahasiswa', 'pengunjung']
  } = req.body;

  // Validate required fields
  if (!title || !description || !type || !startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    return res.status(400).json({
      success: false,
      message: 'End date must be after start date'
    });
  }

  if (start < new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Start date cannot be in the past'
    });
  }

  // Create session
  const sessionData = {
    title,
    description,
    type,
    startDate: start,
    endDate: end,
    status: 'scheduled',
    createdBy: req.user.uid,
    createdAt: new Date(),
    updatedAt: new Date(),
    targetRoles,
    notificationSent: false
  };

  const sessionRef = await db.collection('sessions').add(sessionData);
  const newSession = { id: sessionRef.id, ...sessionData };

  // Send email notifications if requested
  if (sendNotification) {
    try {
      const emailResult = await emailService.sendSessionNotification(newSession);
      
      // Update session with notification status
      await sessionRef.update({
        notificationSent: true,
        emailStats: emailResult
      });

      console.log('📧 Session notification sent:', emailResult);
    } catch (error) {
      console.error('Email notification error:', error);
    }

    // Schedule reminder emails
    try {
      await emailService.scheduleReminders(newSession);
    } catch (error) {
      console.error('Reminder scheduling error:', error);
    }
  }

  res.status(201).json({
    success: true,
    message: 'Session created successfully',
    data: { session: newSession }
  });
}));

// Update session
router.put('/sessions/:id', generalLimiter, asyncHandler(async (req, res) => {
  const sessionId = req.params.id;
  const updateData = req.body;

  const sessionDoc = await db.collection('sessions').doc(sessionId).get();
  
  if (!sessionDoc.exists) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }

  // Update session
  await sessionDoc.ref.update({
    ...updateData,
    updatedAt: new Date(),
    updatedBy: req.user.uid
  });

  // Get updated session
  const updatedSession = await sessionDoc.ref.get();
  const sessionData = { id: updatedSession.id, ...updatedSession.data() };

  // Send update notification if status changed
  if (updateData.status && updateData.sendNotification !== false) {
    try {
      await emailService.sendSessionUpdate(sessionData, updateData.status);
    } catch (error) {
      console.error('Update notification error:', error);
    }
  }

  res.json({
    success: true,
    message: 'Session updated successfully',
    data: { session: sessionData }
  });
}));

// Start session
router.post('/sessions/:id/start', generalLimiter, asyncHandler(async (req, res) => {
  const sessionId = req.params.id;
  
  const sessionDoc = await db.collection('sessions').doc(sessionId).get();
  
  if (!sessionDoc.exists) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }

  const sessionData = sessionDoc.data();
  
  if (sessionData.status !== 'scheduled') {
    return res.status(400).json({
      success: false,
      message: 'Session cannot be started'
    });
  }

  // Update session status
  await sessionDoc.ref.update({
    status: 'active',
    startedAt: new Date(),
    startedBy: req.user.uid,
    updatedAt: new Date()
  });

  const updatedSession = { id: sessionId, ...sessionData, status: 'active' };

  // Send start notification
  try {
    await emailService.sendSessionUpdate(updatedSession, 'Started');
  } catch (error) {
    console.error('Start notification error:', error);
  }

  res.json({
    success: true,
    message: 'Session started successfully',
    data: { session: updatedSession }
  });
}));

// Pause session
router.post('/sessions/:id/pause', generalLimiter, asyncHandler(async (req, res) => {
  const sessionId = req.params.id;
  
  const sessionDoc = await db.collection('sessions').doc(sessionId).get();
  
  if (!sessionDoc.exists) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }

  await sessionDoc.ref.update({
    status: 'paused',
    pausedAt: new Date(),
    pausedBy: req.user.uid,
    updatedAt: new Date()
  });

  const sessionData = { id: sessionId, ...sessionDoc.data(), status: 'paused' };

  // Send pause notification
  try {
    await emailService.sendSessionUpdate(sessionData, 'Paused');
  } catch (error) {
    console.error('Pause notification error:', error);
  }

  res.json({
    success: true,
    message: 'Session paused successfully',
    data: { session: sessionData }
  });
}));

// End session
router.post('/sessions/:id/end', generalLimiter, asyncHandler(async (req, res) => {
  const sessionId = req.params.id;
  
  const sessionDoc = await db.collection('sessions').doc(sessionId).get();
  
  if (!sessionDoc.exists) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }

  await sessionDoc.ref.update({
    status: 'completed',
    endedAt: new Date(),
    endedBy: req.user.uid,
    updatedAt: new Date()
  });

  const sessionData = { id: sessionId, ...sessionDoc.data(), status: 'completed' };

  // Send end notification
  try {
    await emailService.sendSessionUpdate(sessionData, 'Ended');
  } catch (error) {
    console.error('End notification error:', error);
  }

  res.json({
    success: true,
    message: 'Session ended successfully',
    data: { session: sessionData }
  });
}));

// Delete session
router.delete('/sessions/:id', generalLimiter, asyncHandler(async (req, res) => {
  const sessionId = req.params.id;
  
  const sessionDoc = await db.collection('sessions').doc(sessionId).get();
  
  if (!sessionDoc.exists) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }

  const sessionData = sessionDoc.data();

  // Send cancellation notification if session was scheduled/active
  if (['scheduled', 'active', 'paused'].includes(sessionData.status)) {
    try {
      await emailService.sendSessionUpdate(
        { id: sessionId, ...sessionData }, 
        'Cancelled'
      );
    } catch (error) {
      console.error('Cancellation notification error:', error);
    }
  }

  await sessionDoc.ref.delete();

  res.json({
    success: true,
    message: 'Session deleted successfully',
    data: { sessionId }
  });
}));

// Send manual notification
router.post('/sessions/:id/notify', generalLimiter, asyncHandler(async (req, res) => {
  const sessionId = req.params.id;
  const { roles = ['mahasiswa', 'pengunjung'], type = 'reminder' } = req.body;
  
  const sessionDoc = await db.collection('sessions').doc(sessionId).get();
  
  if (!sessionDoc.exists) {
    return res.status(404).json({
      success: false,
      message: 'Session not found'
    });
  }

  const sessionData = { id: sessionId, ...sessionDoc.data() };

  try {
    let results = [];
    
    for (const role of roles) {
      const result = await emailService.sendToRole(sessionData, role, 'sessionNotification');
      results.push({ role, ...result });
    }

    res.json({
      success: true,
      message: 'Notifications sent successfully',
      data: { results }
    });
  } catch (error) {
    console.error('Manual notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notifications',
      error: error.message
    });
  }
}));

// Get notification history
router.get('/notifications', generalLimiter, asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;
  
  try {
    const history = await emailService.getNotificationHistory(parseInt(limit));
    
    res.json({
      success: true,
      data: { notifications: history }
    });
  } catch (error) {
    console.error('Error getting notification history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification history'
    });
  }
}));

// Get voting statistics for monitor
router.get('/voting-stats', generalLimiter, asyncHandler(async (req, res) => {
  const { period = '7d' } = req.query;

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '24h':
      startDate.setHours(startDate.getHours() - 24);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }

  // Get votes in period
  const votesSnapshot = await db
    .collection('votes')
    .where('createdAt', '>=', startDate)
    .where('createdAt', '<=', endDate)
    .get();

  const votingData = {
    totalVotes: votesSnapshot.size,
    dailyVotes: {},
    topWorks: {},
    activeVoters: new Set()
  };

  // Process votes
  for (const doc of votesSnapshot.docs) {
    const voteData = doc.data();
    const date = voteData.createdAt.toDate();
    const dayKey = date.toISOString().split('T')[0];
    
    // Daily votes
    votingData.dailyVotes[dayKey] = (votingData.dailyVotes[dayKey] || 0) + 1;
    
    // Work votes
    votingData.topWorks[voteData.workId] = (votingData.topWorks[voteData.workId] || 0) + 1;
    
    // Active voters
    votingData.activeVoters.add(voteData.userId);
  }

  votingData.activeVoters = votingData.activeVoters.size;

  // Get work details for top works
  const topWorksArray = [];
  for (const [workId, voteCount] of Object.entries(votingData.topWorks)) {
    try {
      const workDoc = await db.collection('works').doc(workId).get();
      if (workDoc.exists) {
        const workData = workDoc.data();
        topWorksArray.push({
          id: workId,
          title: workData.title,
          author: workData.author,
          category: workData.category,
          votes: voteCount,
          totalVotes: workData.votes || 0
        });
      }
    } catch (error) {
      console.error('Error fetching work details:', error);
    }
  }

  // Sort by votes
  topWorksArray.sort((a, b) => b.votes - a.votes);

  res.json({
    success: true,
    data: {
      period,
      totalVotes: votingData.totalVotes,
      activeVoters: votingData.activeVoters,
      dailyVotes: votingData.dailyVotes,
      topWorks: topWorksArray.slice(0, 10)
    }
  });
}));

module.exports = router;