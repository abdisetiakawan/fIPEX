const express = require("express");
const { db } = require("../config/firebase");
const { checkAuth, verifyToken } = require("../middleware/auth");
const {
  generalLimiter,
  voteLimiter,
  commentLimiter,
} = require("../middleware/rateLimiter");
const { asyncHandler } = require("../middleware/errorHandler");
const {
  paginationValidation,
  createCommentValidation,
} = require("../middleware/validation");

const router = express.Router();

// Get all approved works (public)
router.get(
  "/works",
  generalLimiter,
  paginationValidation,
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = "newest",
    } = req.query;

    let query = db.collection("works").where("status", "==", "approved");

    // Filter by category
    if (category && category !== "all") {
      query = query.where("category", "==", category);
    }

    // Apply sorting
    switch (sort) {
      case "oldest":
        query = query.orderBy("createdAt", "asc");
        break;
      case "votes":
        query = query.orderBy("votes", "desc");
        break;
      case "views":
        query = query.orderBy("views", "desc");
        break;
      default:
        query = query.orderBy("createdAt", "desc");
    }

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
            program: authorData.program,
            angkatan: authorData.angkatan,
          };
        }
      }

      works.push(workData);
    }

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      works = works.filter(
        (work) =>
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

// Get single work by ID (public)
router.get(
  "/works/:id",
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

    const workData = { id: workDoc.id, ...workDoc.data() };

    // Only show approved works to public
    if (workData.status !== "approved") {
      return res.status(404).json({
        success: false,
        message: "Work not found",
      });
    }

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
          program: authorData.program,
          angkatan: authorData.angkatan,
        };
      }
    }

    // Increment view count
    await workDoc.ref.update({
      views: (workData.views || 0) + 1,
    });

    res.json({
      success: true,
      data: {
        work: {
          ...workData,
          views: (workData.views || 0) + 1,
        },
      },
    });
  })
);

// Vote for work - REQUIRES AUTHENTICATION
router.post(
  "/works/:id/vote",
  voteLimiter,
  verifyToken, // Require authentication for voting
  asyncHandler(async (req, res) => {
    const workId = req.params.id;
    const userId = req.user.uid;

    // Only allow pengunjung to vote
    if (req.user.role !== "pengunjung") {
      return res.status(403).json({
        success: false,
        message: "Only registered visitors can vote",
      });
    }

    // Check if work exists and is approved
    const workDoc = await db.collection("works").doc(workId).get();
    if (!workDoc.exists || workDoc.data().status !== "approved") {
      return res.status(404).json({
        success: false,
        message: "Work not found",
      });
    }

    // Check if user has already voted
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

    // Create vote record
    const voteData = {
      workId,
      userId,
      userRole: req.user.role,
      createdAt: new Date(),
    };

    await db.collection("votes").add(voteData);

    // Update work vote count
    const workData = workDoc.data();
    await workDoc.ref.update({
      votes: (workData.votes || 0) + 1,
    });

    res.json({
      success: true,
      message: "Vote recorded successfully",
    });
  })
);

// Add comment - REQUIRES AUTHENTICATION
router.post(
  "/works/:id/comments",
  commentLimiter,
  verifyToken, // Require authentication for commenting
  createCommentValidation,
  asyncHandler(async (req, res) => {
    const workId = req.params.id;
    const { content } = req.body;
    const userId = req.user.uid;

    // Check if work exists and is approved
    const workDoc = await db.collection("works").doc(workId).get();
    if (!workDoc.exists || workDoc.data().status !== "approved") {
      return res.status(404).json({
        success: false,
        message: "Work not found",
      });
    }

    // Create comment
    const commentData = {
      workId,
      content: content.trim(),
      userId,
      userRole: req.user.role,
      createdAt: new Date(),
    };

    const commentRef = await db.collection("comments").add(commentData);
    const newComment = { id: commentRef.id, ...commentData };

    // Add user info
    newComment.user = {
      id: userId,
      name: req.user.name,
      role: req.user.role,
    };

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: { comment: newComment },
    });
  })
);

// Get work comments
router.get(
  "/works/:id/comments",
  generalLimiter,
  paginationValidation,
  asyncHandler(async (req, res) => {
    const workId = req.params.id;
    const { page = 1, limit = 10 } = req.query;

    const commentsQuery = await db
      .collection("comments")
      .where("workId", "==", workId)
      .orderBy("createdAt", "desc")
      .get();

    const comments = [];
    for (const commentDoc of commentsQuery.docs) {
      const commentData = { id: commentDoc.id, ...commentDoc.data() };

      // Get commenter info
      if (commentData.userId) {
        const userDoc = await db
          .collection("users")
          .doc(commentData.userId)
          .get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          commentData.user = {
            id: userDoc.id,
            name: userData.name,
            role: userData.role,
          };
        }
      }

      comments.push(commentData);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + Number.parseInt(limit);
    const paginatedComments = comments.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        comments: paginatedComments,
        pagination: {
          currentPage: Number.parseInt(page),
          totalPages: Math.ceil(comments.length / limit),
          totalItems: comments.length,
          itemsPerPage: Number.parseInt(limit),
        },
      },
    });
  })
);

// Get statistics
router.get(
  "/stats",
  generalLimiter,
  asyncHandler(async (req, res) => {
    // Get total works
    const worksSnapshot = await db
      .collection("works")
      .where("status", "==", "approved")
      .get();
    const totalWorks = worksSnapshot.size;

    // Get total students
    const studentsSnapshot = await db
      .collection("users")
      .where("role", "==", "mahasiswa")
      .get();
    const totalStudents = studentsSnapshot.size;

    // Get total pengunjung
    const pengunjungSnapshot = await db
      .collection("users")
      .where("role", "==", "pengunjung")
      .get();
    const totalPengunjung = pengunjungSnapshot.size;

    // Get total votes
    const votesSnapshot = await db.collection("votes").get();
    const totalVotes = votesSnapshot.size;

    // Get categories count
    const categories = {};
    worksSnapshot.forEach((doc) => {
      const category = doc.data().category;
      categories[category] = (categories[category] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalKarya: totalWorks,
        totalMahasiswa: totalStudents,
        totalPengunjung: totalPengunjung,
        totalVote: totalVotes,
        categories,
      },
    });
  })
);

// Get categories
router.get(
  "/categories",
  asyncHandler(async (req, res) => {
    const categories = [
      "Aplikasi Mobile",
      "Web Development",
      "UI/UX Design",
      "Business Plan",
      "Data Science",
      "Game Development",
      "IoT",
      "Machine Learning",
    ];

    res.json({
      success: true,
      data: { categories },
    });
  })
);

module.exports = router;