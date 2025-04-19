/**
 * Custom error class for API errors
 * Extends the built-in Error class
 */
export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Factory function to create API errors
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {ApiError} Custom error object
 */
export const createError = (message, statusCode) => {
  return new ApiError(message, statusCode);
};

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Determine if we're in production or development
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Basic error response
  const errorResponse = {
    status: err.status,
    message: err.message
  };
  
  // Add stack trace and detailed error info in development
  if (!isProduction) {
    errorResponse.stack = err.stack;
    errorResponse.error = err;
  }
  
  res.status(err.statusCode).json(errorResponse);
};