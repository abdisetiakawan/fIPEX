const express = require("express");
const multer = require("multer");
const path = require("path");
const { db } = require("../config/firebase");
const {
  verifyToken,
  studentOnly,
  checkOwnership,
} = require("../middleware/auth");
const { generalLimiter, uploadLimiter } = require("../middleware/rateLimiter");
const { asyncHandler } = require("../middleware/errorHandler");
const {
  createWorkValidation,
  updateWorkValidation,
  paginationValidation,
} = require("../middleware/validation");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Apply auth middleware to all routes
router.use(verifyToken);

// Get user's works
router.get(
  "/my-works",
  generalLimiter,
  studentOnly,
  paginationValidation,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    let query = db.collection("works").where("authorId", "==", req.user.uid);

    // Filter by status
    if (status && status !== "all") {
      query = query.where("status", "==", status);
    }

    // Order by creation date
    query = query.orderBy("createdAt", "desc");

    const worksSnapshot = await query.get();
    const works = [];

    for (const doc of worksSnapshot.docs) {
      const workData = { id: doc.id, ...doc.data() };
      
      // Get vote count for this work
      const votesQuery = await db
        .collection("votes")
        .where("workId", "==", doc.id)
        .get();
      workData.votes = votesQuery.size;
      
      // Get comment count for this work
      const commentsQuery = await db
        .collection("comments")
        .where("workId", "==", doc.id)
        .get();
      workData.commentCount = commentsQuery.size;
      
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

// Get single work
router.get(
  "/:id",
  generalLimiter,
  asyncHandler(async (req, res) => {
    const workId = req.params.id;
    const workDoc = await db.collection("works").doc(workId).get();

    if (!workDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Work not found",
      });
    }

    const workData = workDoc.data();

    // Check if user can access this work
    if (
      workData.authorId !== req.user.uid &&
      req.user.role !== "panitia" &&
      workData.status !== "approved"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: {
        work: {
          id: workDoc.id,
          ...workData,
        },
      },
    });
  })
);

// Create new work
router.post(
  "/",
  uploadLimiter,
  studentOnly,
  upload.single("thumbnail"),
  createWorkValidation,
  asyncHandler(async (req, res) => {
    const {
      title,
      description,
      category,
      technologies,
      tools,
      githubUrl,
      liveUrl,
      figmaUrl,
      videoUrl,
    } = req.body;

    const workData = {
      title,
      description,
      category,
      technologies: technologies
        ? technologies.split(",").map((tech) => tech.trim())
        : [],
      tools: tools ? tools.split(",").map((tool) => tool.trim()) : [],
      githubUrl: githubUrl || "",
      liveUrl: liveUrl || "",
      figmaUrl: figmaUrl || "",
      videoUrl: videoUrl || "",
      authorId: req.user.uid,
      author: req.user.name,
      status: "pending",
      votes: 0,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add thumbnail if uploaded
    if (req.file) {
      workData.thumbnail = `/uploads/${req.file.filename}`;
    }

    // Save to Firestore
    const workRef = await db.collection("works").add(workData);

    res.status(201).json({
      success: true,
      message: "Work created successfully",
      data: {
        work: {
          id: workRef.id,
          ...workData,
        },
      },
    });
  })
);

// Update work
router.put(
  "/:id",
  uploadLimiter,
  studentOnly,
  upload.single("thumbnail"),
  updateWorkValidation,
  checkOwnership("work"),
  asyncHandler(async (req, res) => {
    const workId = req.params.id;
    const {
      title,
      description,
      category,
      technologies,
      tools,
      githubUrl,
      liveUrl,
      figmaUrl,
      videoUrl,
    } = req.body;

    // Work data is already available from middleware
    const workData = req.resourceData;

    // Prepare update data
    const updateData = {
      updatedAt: new Date(),
    };

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (technologies)
      updateData.technologies = technologies
        .split(",")
        .map((tech) => tech.trim());
    if (tools) updateData.tools = tools.split(",").map((tool) => tool.trim());
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
    if (liveUrl !== undefined) updateData.liveUrl = liveUrl;
    if (figmaUrl !== undefined) updateData.figmaUrl = figmaUrl;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;

    // Add new thumbnail if uploaded
    if (req.file) {
      updateData.thumbnail = `/uploads/${req.file.filename}`;
    }

    // Reset status to pending if work was previously rejected
    if (workData.status === "rejected") {
      updateData.status = "pending";
      updateData.feedback = "";
    }

    // Update work
    await db.collection("works").doc(workId).update(updateData);

    // Get updated work
    const updatedWorkDoc = await db.collection("works").doc(workId).get();

    res.json({
      success: true,
      message: "Work updated successfully",
      data: {
        work: {
          id: updatedWorkDoc.id,
          ...updatedWorkDoc.data(),
        },
      },
    });
  })
);

// Delete work
router.delete(
  "/:id",
  generalLimiter,
  studentOnly,
  checkOwnership("work"),
  asyncHandler(async (req, res) => {
    const workId = req.params.id;

    // Work existence is already verified by middleware
    // Delete work
    await db.collection("works").doc(workId).delete();

    // Also delete related votes
    const votesQuery = await db
      .collection("votes")
      .where("workId", "==", workId)
      .get();
    const batch = db.batch();

    votesQuery.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    res.json({
      success: true,
      message: "Work deleted successfully",
      data: { workId },
    });
  })
);

// Vote for work
router.post(
  "/:id/vote",
  generalLimiter,
  asyncHandler(async (req, res) => {
    const workId = req.params.id;
    const userId = req.user.uid;

    // Check if work exists and is approved
    const workDoc = await db.collection("works").doc(workId).get();

    if (!workDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Work not found",
      });
    }

    const workData = workDoc.data();

    if (workData.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Can only vote for approved works",
      });
    }

    // Check if user already voted
    const existingVoteQuery = await db
      .collection("votes")
      .where("workId", "==", workId)
      .where("userId", "==", userId)
      .get();

    if (!existingVoteQuery.empty) {
      return res.status(400).json({
        success: false,
        message: "You have already voted for this work",
      });
    }

    // Add vote
    await db.collection("votes").add({
      workId,
      userId,
      createdAt: new Date(),
    });

    // Update work vote count
    await workDoc.ref.update({
      votes: (workData.votes || 0) + 1,
    });

    res.json({
      success: true,
      message: "Vote added successfully",
      data: {
        workId,
        votes: (workData.votes || 0) + 1,
      },
    });
  })
);

// Remove vote
router.delete(
  "/:id/vote",
  generalLimiter,
  asyncHandler(async (req, res) => {
    const workId = req.params.id;
    const userId = req.user.uid;

    // Check if work exists
    const workDoc = await db.collection("works").doc(workId).get();

    if (!workDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Work not found",
      });
    }

    // Find and remove vote
    const voteQuery = await db
      .collection("votes")
      .where("workId", "==", workId)
      .where("userId", "==", userId)
      .get();

    if (voteQuery.empty) {
      return res.status(400).json({
        success: false,
        message: "You haven't voted for this work",
      });
    }

    // Delete vote
    await voteQuery.docs[0].ref.delete();

    // Update work vote count
    const workData = workDoc.data();
    await workDoc.ref.update({
      votes: Math.max((workData.votes || 0) - 1, 0),
    });

    res.json({
      success: true,
      message: "Vote removed successfully",
      data: {
        workId,
        votes: Math.max((workData.votes || 0) - 1, 0),
      },
    });
  })
);

module.exports = router;
