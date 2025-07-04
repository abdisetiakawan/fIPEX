const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error
  const error = {
    success: false,
    message: err.message || "Internal Server Error",
    code: "INTERNAL_ERROR",
  };

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error.message = "Resource not found";
    error.code = "RESOURCE_NOT_FOUND";
    return res.status(404).json(error);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field} already exists`;
    error.code = "DUPLICATE_FIELD";
    return res.status(400).json(error);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    error.message = "Validation failed";
    error.code = "VALIDATION_ERROR";
    error.errors = errors;
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid token";
    error.code = "INVALID_TOKEN";
    return res.status(401).json(error);
  }

  if (err.name === "TokenExpiredError") {
    error.message = "Token expired";
    error.code = "TOKEN_EXPIRED";
    return res.status(401).json(error);
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    error.message = "File too large";
    error.code = "FILE_TOO_LARGE";
    return res.status(400).json(error);
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    error.message = "Too many files";
    error.code = "TOO_MANY_FILES";
    return res.status(400).json(error);
  }

  // Firebase errors
  if (typeof err.code === "string" && err.code.startsWith("auth/")) {
    error.message = "Authentication error";
    error.code = "AUTH_ERROR";
    return res.status(401).json(error);
  }

  // Default to 500 server error
  res.status(500).json(error);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    code: "ROUTE_NOT_FOUND",
  });
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
};
