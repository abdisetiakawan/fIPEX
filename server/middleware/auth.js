const jwt = require("jsonwebtoken");
const { db } = require("../config/firebase");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Verify JWT token from cookie
const verifyToken = async (req, res, next) => {
  try {
    // Get token from cookie instead of Authorization header
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
        code: "TOKEN_REQUIRED",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user from database
    const userDoc = await db.collection("users").doc(decoded.uid).get();

    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
        code: "USER_NOT_FOUND",
      });
    }

    const userData = userDoc.data();

    // Check if user is active
    if (userData.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
        code: "ACCOUNT_INACTIVE",
      });
    }

    // Add user info to request
    req.user = {
      uid: userDoc.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      status: userData.status,
      ...userData,
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Token verification failed",
      code: "TOKEN_VERIFICATION_ERROR",
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
        required: roles,
        current: req.user.role,
      });
    }

    next();
  };
};

// Check if user is authenticated (optional middleware)
const checkAuth = async (req, res, next) => {
  try {
    const token = req.cookies.authToken;

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userDoc = await db.collection("users").doc(decoded.uid).get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        
        // Only set user if account is active
        if (userData.status === "active") {
          req.user = {
            uid: userDoc.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            status: userData.status,
            ...userData,
          };
        }
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    console.log("Optional auth check failed:", error.message);
    next();
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      code: "AUTH_REQUIRED",
    });
  }

  if (req.user.role !== "panitia") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
      code: "ADMIN_REQUIRED",
    });
  }

  next();
};

// Student only middleware
const studentOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      code: "AUTH_REQUIRED",
    });
  }

  if (req.user.role !== "mahasiswa") {
    return res.status(403).json({
      success: false,
      message: "Student access required",
      code: "STUDENT_REQUIRED",
    });
  }

  next();
};

// Check if user owns resource - improved version
const checkOwnership = (resourceType = "work") => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      // Admin can access all resources
      if (req.user.role === "panitia") {
        return next();
      }

      const resourceId = req.params.id;

      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: "Resource ID required",
          code: "RESOURCE_ID_REQUIRED",
        });
      }

      // Check ownership based on resource type
      let resourceDoc;
      let authorField = "authorId";

      switch (resourceType) {
        case "work":
          resourceDoc = await db.collection("works").doc(resourceId).get();
          break;
        case "comment":
          resourceDoc = await db.collection("comments").doc(resourceId).get();
          authorField = "userId";
          break;
        default:
          resourceDoc = await db.collection("works").doc(resourceId).get();
      }

      if (!resourceDoc.exists) {
        return res.status(404).json({
          success: false,
          message: "Resource not found",
          code: "RESOURCE_NOT_FOUND",
        });
      }

      const resourceData = resourceDoc.data();
      const resourceAuthorId = resourceData[authorField];

      if (resourceAuthorId !== req.user.uid) {
        return res.status(403).json({
          success: false,
          message: "Access denied - not resource owner",
          code: "NOT_OWNER",
        });
      }

      // Add resource data to request for further use
      req.resourceData = resourceData;
      req.resourceId = resourceId;

      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      return res.status(500).json({
        success: false,
        message: "Ownership verification failed",
        code: "OWNERSHIP_CHECK_ERROR",
      });
    }
  };
};

// Validate user status
const validateUserStatus = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    // Get fresh user data
    const userDoc = await db.collection("users").doc(req.user.uid).get();

    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    const userData = userDoc.data();

    // Check if user is still active
    if (userData.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive or suspended",
        code: "ACCOUNT_INACTIVE",
      });
    }

    // Update user data in request
    req.user = {
      uid: userDoc.id,
      ...userData,
    };

    next();
  } catch (error) {
    console.error("User status validation error:", error);
    return res.status(500).json({
      success: false,
      message: "User validation failed",
      code: "VALIDATION_ERROR",
    });
  }
};

module.exports = {
  verifyToken,
  authorize,
  checkAuth,
  adminOnly,
  studentOnly,
  checkOwnership,
  validateUserStatus,
};