const express = require("express");
const { db } = require("../config/firebase");
const { verifyToken, adminOnly } = require("../middleware/auth");
const { generalLimiter } = require("../middleware/rateLimiter");
const { asyncHandler } = require("../middleware/errorHandler");
const {
  paginationValidation,
  approveWorkValidation,
  updateUserStatusValidation,
} = require("../middleware/validation");

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(verifyToken);
router.use(adminOnly);

// Get comprehensive dashboard stats
router.get(
  "/dashboard",
  generalLimiter,
  asyncHandler(async (req, res) => {
    // Get all works with detailed stats
    const worksSnapshot = await db.collection("works").get();
    const workStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      draft: 0,
      totalVotes: 0,
      totalViews: 0,
    };

    const categoryStats = {};
    const monthlySubmissions = {};
    const topWorks = [];

    for (const doc of worksSnapshot.docs) {
      const workData = { id: doc.id, ...doc.data() };
      const status = workData.status;
      const category = workData.category;
      const createdAt = workData.createdAt;

      // Basic stats
      workStats.total++;
      workStats[status] = (workStats[status] || 0) + 1;
      workStats.totalVotes += workData.votes || 0;
      workStats.totalViews += workData.views || 0;

      // Category stats
      if (category) {
        if (!categoryStats[category]) {
          categoryStats[category] = {
            total: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
            totalVotes: 0,
          };
        }
        categoryStats[category].total++;
        categoryStats[category][status] = (categoryStats[category][status] || 0) + 1;
        categoryStats[category].totalVotes += workData.votes || 0;
      }

      // Monthly submissions
      if (createdAt) {
        const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlySubmissions[monthKey] = (monthlySubmissions[monthKey] || 0) + 1;
      }

      // Collect for top works (approved only)
      if (status === 'approved') {
        // Get author info
        if (workData.authorId) {
          try {
            const authorDoc = await db.collection("users").doc(workData.authorId).get();
            if (authorDoc.exists) {
              const authorData = authorDoc.data();
              workData.author = {
                name: authorData.name,
                program: authorData.program,
                angkatan: authorData.angkatan,
              };
            }
          } catch (error) {
            console.error("Error fetching author:", error);
            workData.author = { name: "Unknown" };
          }
        }
        topWorks.push(workData);
      }
    }

    // Sort top works by votes
    topWorks.sort((a, b) => (b.votes || 0) - (a.votes || 0));

    // Get user stats by role
    const usersSnapshot = await db.collection("users").get();
    const userStats = {
      total: 0,
      mahasiswa: 0,
      panitia: 0,
      pengunjung: 0,
      active: 0,
      inactive: 0,
    };

    const programStats = {};
    const angkatanStats = {};

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const role = userData.role;
      const status = userData.status || 'active';
      const program = userData.program;
      const angkatan = userData.angkatan;

      userStats.total++;
      userStats[role] = (userStats[role] || 0) + 1;
      userStats[status] = (userStats[status] || 0) + 1;

      // Program stats (for mahasiswa)
      if (role === 'mahasiswa' && program) {
        programStats[program] = (programStats[program] || 0) + 1;
      }

      // Angkatan stats (for mahasiswa)
      if (role === 'mahasiswa' && angkatan) {
        angkatanStats[angkatan] = (angkatanStats[angkatan] || 0) + 1;
      }
    });

    // Get voting stats
    const votesSnapshot = await db.collection("votes").get();
    const votingStats = {
      totalVotes: votesSnapshot.size,
      uniqueVoters: new Set(),
      votesPerDay: {},
      topVotedWorks: [],
    };

    const workVoteCounts = {};

    for (const voteDoc of votesSnapshot.docs) {
      const voteData = voteDoc.data();
      const userId = voteData.userId;
      const workId = voteData.workId;
      const createdAt = voteData.createdAt;

      // Track unique voters
      votingStats.uniqueVoters.add(userId);

      // Track votes per work
      workVoteCounts[workId] = (workVoteCounts[workId] || 0) + 1;

      // Track votes per day
      if (createdAt) {
        const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
        const dayKey = date.toISOString().split('T')[0];
        votingStats.votesPerDay[dayKey] = (votingStats.votesPerDay[dayKey] || 0) + 1;
      }
    }

    votingStats.uniqueVoters = votingStats.uniqueVoters.size;

    // Get comments stats
    const commentsSnapshot = await db.collection("comments").get();
    const commentStats = {
      total: commentsSnapshot.size,
      commentsPerDay: {},
    };

    commentsSnapshot.forEach((doc) => {
      const commentData = doc.data();
      const createdAt = commentData.createdAt;

      if (createdAt) {
        const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
        const dayKey = date.toISOString().split('T')[0];
        commentStats.commentsPerDay[dayKey] = (commentStats.commentsPerDay[dayKey] || 0) + 1;
      }
    });

    // Get recent activities
    const recentActivities = [];

    // Recent submissions
    const recentWorksQuery = await db
      .collection("works")
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    for (const doc of recentWorksQuery.docs) {
      const workData = doc.data();
      recentActivities.push({
        id: doc.id,
        type: 'submission',
        title: workData.title,
        author: workData.author || 'Unknown',
        category: workData.category,
        status: workData.status,
        timestamp: workData.createdAt,
        timeAgo: getTimeAgo(workData.createdAt),
      });
    }

    // Recent votes
    const recentVotesQuery = await db
      .collection("votes")
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    for (const doc of recentVotesQuery.docs) {
      const voteData = doc.data();
      
      // Get work title
      try {
        const workDoc = await db.collection("works").doc(voteData.workId).get();
        const workTitle = workDoc.exists ? workDoc.data().title : 'Unknown Work';
        
        recentActivities.push({
          id: doc.id,
          type: 'vote',
          title: workTitle,
          voter: voteData.userName || 'Anonymous',
          timestamp: voteData.createdAt,
          timeAgo: getTimeAgo(voteData.createdAt),
        });
      } catch (error) {
        console.error("Error fetching work for vote:", error);
      }
    }

    // Sort activities by timestamp
    recentActivities.sort((a, b) => {
      const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return timeB - timeA;
    });

    // Calculate approval rate
    const approvalRate = workStats.total > 0 
      ? Math.round((workStats.approved / workStats.total) * 100) 
      : 0;

    // Calculate participation rate (voters vs total pengunjung)
    const participationRate = userStats.pengunjung > 0 
      ? Math.round((votingStats.uniqueVoters / userStats.pengunjung) * 100) 
      : 0;

    res.json({
      success: true,
      data: {
        workStats,
        userStats,
        votingStats,
        commentStats,
        categoryStats,
        programStats,
        angkatanStats,
        monthlySubmissions,
        topWorks: topWorks.slice(0, 10),
        recentActivities: recentActivities.slice(0, 10),
        approvalRate,
        participationRate,
        summary: {
          totalProjects: workStats.total,
          pendingReview: workStats.pending,
          totalVotes: votingStats.totalVotes,
          activeUsers: userStats.active,
          totalComments: commentStats.total,
        }
      },
    });
  })
);

// Get detailed voting analytics
router.get(
  "/voting-analytics",
  generalLimiter,
  asyncHandler(async (req, res) => {
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
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get votes in period
    const votesSnapshot = await db
      .collection("votes")
      .where("createdAt", ">=", startDate)
      .where("createdAt", "<=", endDate)
      .get();

    const votingTrends = {};
    const workVotes = {};
    const voterActivity = {};

    for (const doc of votesSnapshot.docs) {
      const voteData = doc.data();
      const createdAt = voteData.createdAt.toDate();
      const workId = voteData.workId;
      const userId = voteData.userId;

      // Daily trends
      const dayKey = createdAt.toISOString().split('T')[0];
      votingTrends[dayKey] = (votingTrends[dayKey] || 0) + 1;

      // Work votes
      workVotes[workId] = (workVotes[workId] || 0) + 1;

      // Voter activity
      voterActivity[userId] = (voterActivity[userId] || 0) + 1;
    }

    // Get top voted works with details
    const topVotedWorks = [];
    for (const [workId, voteCount] of Object.entries(workVotes)) {
      try {
        const workDoc = await db.collection("works").doc(workId).get();
        if (workDoc.exists) {
          const workData = workDoc.data();
          topVotedWorks.push({
            id: workId,
            title: workData.title,
            category: workData.category,
            author: workData.author,
            totalVotes: workData.votes || 0,
            periodVotes: voteCount,
            status: workData.status,
          });
        }
      } catch (error) {
        console.error("Error fetching work details:", error);
      }
    }

    // Sort by period votes
    topVotedWorks.sort((a, b) => b.periodVotes - a.periodVotes);

    // Get most active voters
    const topVoters = [];
    for (const [userId, voteCount] of Object.entries(voterActivity)) {
      try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          topVoters.push({
            id: userId,
            name: userData.name,
            role: userData.role,
            institution: userData.institution || userData.program,
            periodVotes: voteCount,
          });
        }
      } catch (error) {
        console.error("Error fetching voter details:", error);
      }
    }

    // Sort by period votes
    topVoters.sort((a, b) => b.periodVotes - a.periodVotes);

    res.json({
      success: true,
      data: {
        period,
        totalVotes: votesSnapshot.size,
        votingTrends,
        topVotedWorks: topVotedWorks.slice(0, 10),
        topVoters: topVoters.slice(0, 10),
        summary: {
          averageVotesPerDay: Math.round(votesSnapshot.size / Math.max(Object.keys(votingTrends).length, 1)),
          uniqueWorks: Object.keys(workVotes).length,
          uniqueVoters: Object.keys(voterActivity).length,
        }
      },
    });
  })
);

// Get works performance analytics
router.get(
  "/works-analytics",
  generalLimiter,
  asyncHandler(async (req, res) => {
    const { category, status = 'approved' } = req.query;

    let query = db.collection("works");
    
    if (status !== 'all') {
      query = query.where("status", "==", status);
    }
    
    if (category && category !== 'all') {
      query = query.where("category", "==", category);
    }

    const worksSnapshot = await query.get();
    const works = [];

    for (const doc of worksSnapshot.docs) {
      const workData = { id: doc.id, ...doc.data() };

      // Get author details
      if (workData.authorId) {
        try {
          const authorDoc = await db.collection("users").doc(workData.authorId).get();
          if (authorDoc.exists) {
            const authorData = authorDoc.data();
            workData.authorDetails = {
              name: authorData.name,
              program: authorData.program,
              angkatan: authorData.angkatan,
              nim: authorData.nim,
            };
          }
        } catch (error) {
          console.error("Error fetching author:", error);
        }
      }

      // Get vote details
      const votesQuery = await db
        .collection("votes")
        .where("workId", "==", doc.id)
        .get();

      workData.voteDetails = {
        count: votesQuery.size,
        voters: [],
      };

      // Get voter details (limit to recent 10)
      const recentVotes = votesQuery.docs.slice(0, 10);
      for (const voteDoc of recentVotes) {
        const voteData = voteDoc.data();
        workData.voteDetails.voters.push({
          userName: voteData.userName,
          userRole: voteData.userRole,
          votedAt: voteData.createdAt,
        });
      }

      // Get comment count
      const commentsQuery = await db
        .collection("comments")
        .where("workId", "==", doc.id)
        .get();

      workData.commentCount = commentsQuery.size;

      // Calculate engagement score
      workData.engagementScore = (workData.votes || 0) * 2 + (workData.views || 0) * 0.1 + workData.commentCount * 3;

      works.push(workData);
    }

    // Sort by engagement score
    works.sort((a, b) => b.engagementScore - a.engagementScore);

    res.json({
      success: true,
      data: {
        works,
        summary: {
          totalWorks: works.length,
          totalVotes: works.reduce((sum, work) => sum + (work.votes || 0), 0),
          totalViews: works.reduce((sum, work) => sum + (work.views || 0), 0),
          totalComments: works.reduce((sum, work) => sum + work.commentCount, 0),
          averageEngagement: works.length > 0 
            ? Math.round(works.reduce((sum, work) => sum + work.engagementScore, 0) / works.length)
            : 0,
        }
      },
    });
  })
);

// Helper function to calculate time ago
function getTimeAgo(timestamp) {
  if (!timestamp) return 'Unknown time';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} detik lalu`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} hari lalu`;
  
  return date.toLocaleDateString('id-ID');
}

// Get all works for review (existing endpoint - enhanced)
router.get(
  "/works",
  generalLimiter,
  paginationValidation,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, category, search } = req.query;

    let query = db.collection("works");

    // Filter by status
    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }

    // Filter by category
    if (category && category !== "all") {
      query = query.where("category", "==", category);
    }

    // Order by creation date
    query = query.orderBy("createdAt", "desc");

    const worksSnapshot = await query.get();
    let works = [];

    for (const doc of worksSnapshot.docs) {
      const workData = { id: doc.id, ...doc.data() };

      // Get author info
      if (workData.authorId) {
        const authorDoc = await db
          .collection("users")
          .doc(workData.authorId)
          .get();
        if (authorDoc.exists) {
          const authorData = authorDoc.data();
          workData.author = {
            id: authorDoc.id,
            name: authorData.name,
            email: authorData.email,
            nim: authorData.nim,
            program: authorData.program,
            angkatan: authorData.angkatan,
          };
        }
      }

      // Get vote count
      const votesQuery = await db
        .collection("votes")
        .where("workId", "==", doc.id)
        .get();
      workData.voteCount = votesQuery.size;

      // Get comment count
      const commentsQuery = await db
        .collection("comments")
        .where("workId", "==", doc.id)
        .get();
      workData.commentCount = commentsQuery.size;

      works.push(workData);
    }

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      works = works.filter(work => 
        work.title.toLowerCase().includes(searchTerm) ||
        work.description.toLowerCase().includes(searchTerm) ||
        work.author?.name.toLowerCase().includes(searchTerm)
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + Number.parseInt(limit);
    const paginatedWorks = works.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        works: paginatedWorks,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(works.length / limit),
          totalItems: works.length,
          itemsPerPage: Number.parseInt(limit),
        },
      },
    });
  })
);

// Review work (approve/reject) - enhanced
router.put(
  "/works/:id/review",
  generalLimiter,
  approveWorkValidation,
  asyncHandler(async (req, res) => {
    const workId = req.params.id;
    const { status, feedback } = req.body;

    const workDoc = await db.collection("works").doc(workId).get();

    if (!workDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Work not found",
      });
    }

    // Update work status
    await workDoc.ref.update({
      status,
      feedback: feedback || "",
      reviewedBy: req.user.uid,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    });

    // Get updated work data
    const updatedWork = await workDoc.ref.get();
    const workData = updatedWork.data();

    res.json({
      success: true,
      message: `Work ${status} successfully`,
      data: {
        work: {
          id: workId,
          ...workData,
        },
      },
    });
  })
);

// Get all users (existing endpoint - enhanced)
router.get(
  "/users",
  generalLimiter,
  paginationValidation,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role, status, search } = req.query;

    let query = db.collection("users");

    // Filter by role
    if (role && role !== "all") {
      query = query.where("role", "==", role);
    }

    // Filter by status
    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }

    // Order by creation date
    query = query.orderBy("createdAt", "desc");

    const usersSnapshot = await query.get();
    let users = [];

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      delete userData.password; // Remove password from response
      
      const user = {
        id: doc.id,
        ...userData,
      };

      // Get user statistics
      if (userData.role === 'mahasiswa') {
        // Get works count
        const worksQuery = await db
          .collection("works")
          .where("authorId", "==", doc.id)
          .get();
        user.worksCount = worksQuery.size;
        
        // Get approved works count
        const approvedWorksQuery = await db
          .collection("works")
          .where("authorId", "==", doc.id)
          .where("status", "==", "approved")
          .get();
        user.approvedWorksCount = approvedWorksQuery.size;
      } else if (userData.role === 'pengunjung') {
        // Get votes count
        const votesQuery = await db
          .collection("votes")
          .where("userId", "==", doc.id)
          .get();
        user.votesCount = votesQuery.size;
        
        // Get comments count
        const commentsQuery = await db
          .collection("comments")
          .where("userId", "==", doc.id)
          .get();
        user.commentsCount = commentsQuery.size;
      }

      users.push(user);
    }

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      users = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        (user.nim && user.nim.toLowerCase().includes(searchTerm))
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + Number.parseInt(limit);
    const paginatedUsers = users.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(users.length / limit),
          totalItems: users.length,
          itemsPerPage: Number.parseInt(limit),
        },
      },
    });
  })
);

// Update user status
router.put(
  "/users/:id/status",
  generalLimiter,
  updateUserStatusValidation,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { status } = req.body;

    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user status
    await userDoc.ref.update({
      status,
      updatedAt: new Date(),
    });

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      data: {
        userId,
        status,
      },
    });
  })
);

// Delete user
router.delete(
  "/users/:id",
  generalLimiter,
  asyncHandler(async (req, res) => {
    const userId = req.params.id;

    // Check if user exists
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Don't allow deleting panitia users
    const userData = userDoc.data();
    if (userData.role === "panitia") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete panitia users",
      });
    }

    // Delete user
    await userDoc.ref.delete();

    res.json({
      success: true,
      message: "User deleted successfully",
      data: { userId },
    });
  })
);

module.exports = router;