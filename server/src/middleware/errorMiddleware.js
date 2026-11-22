/**
 * Centralized API Error Response Formatter and Handler
 */
export class ApiError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details = null) {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'Authentication required.') {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Access denied: insufficient permissions.') {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Requested resource not found.') {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(message = 'Resource conflict or duplicate entry.') {
    return new ApiError(409, 'CONFLICT', message);
  }

  static internal(message = 'Internal server error.') {
    return new ApiError(500, 'INTERNAL_SERVER_ERROR', message);
  }
}

/**
 * Global Express Error Handling Middleware
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred.';

  // Structured response envelope
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (err.details) {
    response.error.details = err.details;
  }

  // Log server errors for diagnostics, never leak secrets
  if (statusCode >= 500) {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json(response);
}

/**
 * 404 Route Not Found Handler
 */
export function notFoundHandler(req, res, next) {
  next(new ApiError(404, 'NOT_FOUND', `Cannot ${req.method} ${req.originalUrl}`));
}
