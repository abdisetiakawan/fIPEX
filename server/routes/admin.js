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

// Get dashboard stats
router.get(
  "/dashboard",
  generalLimiter,
  asyncHandler(async (req, res) => {
    // Get total works by status
    const worksSnapshot = await db.collection("works").get();
    const workStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    worksSnapshot.forEach((doc) => {
      const status = doc.data().status;
      workStats.total++;
      workStats[status] = (workStats[status] || 0) + 1;
    });

    // Get total users by role
    const usersSnapshot = await db.collection("users").get();
    const userStats = {
      total: 0,
      mahasiswa: 0,
      panitia: 0,
      pengunjung: 0,
    };

    usersSnapshot.forEach((doc) => {
      const role = doc.data().role;
      userStats.total++;
      userStats[role] = (userStats[role] || 0) + 1;
    });

    // Get recent activities (last 10 works)
    const recentWorksQuery = await db
      .collection("works")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();
    const recentWorks = [];

    for (const doc of recentWorksQuery.docs) {
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
            name: authorData.name,
            program: authorData.program,
          };
        }
      }

      recentWorks.push(workData);
    }

    res.json({
      success: true,
      data: {
        workStats,
        userStats,
        recentWorks,
      },
    });
  })
);

// Get all works for review
router.get(
  "/works",
  generalLimiter,
  paginationValidation,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, category } = req.query;

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
    const works = [];

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

      works.push(workData);
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

// Review work (approve/reject)
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

    res.json({
      success: true,
      message: `Work ${status} successfully`,
      data: {
        workId,
        status,
        feedback,
      },
    });
  })
);

// Get all users
router.get(
  "/users",
  generalLimiter,
  paginationValidation,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role } = req.query;

    let query = db.collection("users");

    // Filter by role
    if (role && role !== "all") {
      query = query.where("role", "==", role);
    }

    // Order by creation date
    query = query.orderBy("createdAt", "desc");

    const usersSnapshot = await query.get();
    const users = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      delete userData.password; // Remove password from response
      users.push({
        id: doc.id,
        ...userData,
      });
    });

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
