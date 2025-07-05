const { body, param, query, validationResult } = require("express-validator");

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// Auth validation rules
const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  body("role")
    .isIn(["mahasiswa", "panitia", "pengunjung"])
    .withMessage("Invalid role selected"),

  // Conditional validation for mahasiswa
  body("nim")
    .if(body("role").equals("mahasiswa"))
    .notEmpty()
    .withMessage("NIM is required for students")
    .isLength({ min: 8, max: 15 })
    .withMessage("NIM must be between 8 and 15 characters")
    .isAlphanumeric()
    .withMessage("NIM can only contain letters and numbers"),

  body("program")
    .if(body("role").equals("mahasiswa"))
    .notEmpty()
    .withMessage("Program is required for students")
    .isLength({ min: 2, max: 100 })
    .withMessage("Program must be between 2 and 100 characters"),

  body("angkatan")
    .if(body("role").equals("mahasiswa"))
    .notEmpty()
    .withMessage("Angkatan is required for students")
    .isInt({ min: 2000, max: new Date().getFullYear() + 5 })
    .withMessage("Please provide a valid angkatan year"),

  // Conditional validation for pengunjung
  body("phone")
    .if(body("role").equals("pengunjung"))
    .optional()
    .isMobilePhone("id-ID")
    .withMessage("Please provide a valid Indonesian phone number"),

  body("institution")
    .if(body("role").equals("pengunjung"))
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Institution must be between 2 and 100 characters"),

  body("termsAccepted")
    .equals("true")
    .withMessage("You must accept the terms and conditions"),

  handleValidationErrors,
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password").notEmpty().withMessage("Password is required"),

  body("role")
    .isIn(["mahasiswa", "panitia", "pengunjung"])
    .withMessage("Invalid role selected"),

  handleValidationErrors,
];

// Profile validation rules
const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("bio")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),

  body("phone")
    .optional()
    .isMobilePhone("id-ID")
    .withMessage("Please provide a valid Indonesian phone number"),

  body("linkedin")
    .optional()
    .isURL()
    .withMessage("Please provide a valid LinkedIn URL"),

  body("github")
    .optional()
    .isURL()
    .withMessage("Please provide a valid GitHub URL"),

  body("portfolio")
    .optional()
    .isURL()
    .withMessage("Please provide a valid portfolio URL"),

  body("behance")
    .optional()
    .isURL()
    .withMessage("Please provide a valid Behance URL"),

  body("institution")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Institution must be between 2 and 100 characters"),

  handleValidationErrors,
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match new password");
    }
    return true;
  }),

  handleValidationErrors,
];

// Work validation rules
const createWorkValidation = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("category")
    .isIn([
      "Aplikasi Mobile",
      "Web Development",
      "UI/UX Design",
      "Business Plan",
      "Data Science",
    ])
    .withMessage("Invalid category selected"),

  body("technologies")
    .optional()
    .isString()
    .withMessage("Technologies must be a string"),

  body("tools").optional().isString().withMessage("Tools must be a string"),

  body("githubUrl")
    .optional()
    .isURL()
    .withMessage("Please provide a valid GitHub URL"),

  body("liveUrl")
    .optional()
    .isURL()
    .withMessage("Please provide a valid demo URL"),

  body("figmaUrl")
    .optional()
    .isURL()
    .withMessage("Please provide a valid Figma URL"),

  body("videoUrl")
    .optional()
    .isURL()
    .withMessage("Please provide a valid video URL"),

  handleValidationErrors,
];

const updateWorkValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("category")
    .optional()
    .isIn([
      "Aplikasi Mobile",
      "Web Development",
      "UI/UX Design",
      "Business Plan",
      "Data Science",
    ])
    .withMessage("Invalid category selected"),

  body("technologies")
    .optional()
    .isString()
    .withMessage("Technologies must be a string"),

  body("tools").optional().isString().withMessage("Tools must be a string"),

  body("githubUrl")
    .optional()
    .isURL()
    .withMessage("Please provide a valid GitHub URL"),

  body("liveUrl")
    .optional()
    .isURL()
    .withMessage("Please provide a valid demo URL"),

  body("figmaUrl")
    .optional()
    .isURL()
    .withMessage("Please provide a valid Figma URL"),

  body("videoUrl")
    .optional()
    .isURL()
    .withMessage("Please provide a valid video URL"),

  handleValidationErrors,
];

// Comment validation rules
const createCommentValidation = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Comment must be between 1 and 500 characters"),

  handleValidationErrors,
];

// Vote validation rules
const voteValidation = [
  handleValidationErrors,
];

// Admin validation rules
const updateUserStatusValidation = [
  body("status")
    .isIn(["active", "inactive", "banned"])
    .withMessage("Invalid status"),

  handleValidationErrors,
];

const approveWorkValidation = [
  body("status")
    .isIn(["approved", "rejected"])
    .withMessage("Invalid approval status"),

  body("feedback")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Feedback cannot exceed 500 characters"),

  handleValidationErrors,
];

// Query validation rules
const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("search")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Search query cannot exceed 100 characters"),

  query("category")
    .optional()
    .isIn(["Aplikasi Mobile", "Web Development", "UI/UX Design", "Business Plan", "Data Science"])
    .withMessage("Invalid category"),

  query("status")
    .optional()
    .isIn(["pending", "approved", "rejected"])
    .withMessage("Invalid status"),

  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  createWorkValidation,
  updateWorkValidation,
  createCommentValidation,
  voteValidation,
  updateUserStatusValidation,
  approveWorkValidation,
  paginationValidation,
  handleValidationErrors,
};