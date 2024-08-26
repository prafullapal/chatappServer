// Success Response Handler
const successResponse = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

// Error Response Handler
const errorResponse = (res, error, statusCode = 500) => {
  let message = "An error occurred";

  if (typeof error === "string") {
    message = error;
  } else if (error.message) {
    message = error.message;
  }

  return res.status(statusCode).json({
    success: false,
    status: "error",
    message,
    stack: process.env.NODE_ENV === "development" ? error.stack : {},
  });
};

// Middleware to catch unhandled routes
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, "Page not found", 404);
};

// Global Error Handling Middleware
const globalErrorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err);
  return errorResponse(res, err, err.status);
};

module.exports = {
  successResponse,
  errorResponse,
  notFoundHandler,
  globalErrorHandler,
};
