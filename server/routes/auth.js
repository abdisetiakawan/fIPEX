const express = require("express");
const { verifyToken } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiter");
const { asyncHandler } = require("../middleware/errorHandler");
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} = require("../middleware/validation");
const authService = require("../services/authService");

const router = express.Router();

// Cookie options
const cookieOptions = {
  httpOnly: true, // Prevent XSS attacks
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

// Register endpoint
router.post(
  "/register",
  authLimiter,
  registerValidation,
  asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);

    // Set cookie with token
    res.cookie("authToken", result.data.token, cookieOptions);

    // Don't send token in response body for security
    const { token, ...responseData } = result.data;

    res.status(201).json({
      ...result,
      data: responseData,
    });
  })
);

// Login endpoint
router.post(
  "/login",
  authLimiter,
  loginValidation,
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);

    // Set cookie with token
    res.cookie("authToken", result.data.token, cookieOptions);

    // Don't send token in response body for security
    const { token, ...responseData } = result.data;

    res.json({
      ...result,
      data: responseData,
    });
  })
);

// Get current user
router.get(
  "/me",
  verifyToken,
  asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.user.uid);
    res.json({
      success: true,
      data: { user },
    });
  })
);

// Update profile
router.put(
  "/profile",
  verifyToken,
  updateProfileValidation,
  asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user.uid, req.body);
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  })
);

// Change password
router.put(
  "/change-password",
  verifyToken,
  changePasswordValidation,
  asyncHandler(async (req, res) => {
    const result = await authService.changePassword(req.user.uid, req.body);
    res.json(result);
  })
);

// Logout endpoint
router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    // Clear the auth cookie
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.json({
      success: true,
      message: "Logout successful",
    });
  })
);

module.exports = router;
