import { sendError } from '../utils/apiResponse.js';

/**
 * 404 Route Not Found Middleware
 */
export const notFound = (req, res, next) => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, null, 404);
};

/**
 * Global Unhandled Exception & Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  sendError(res, message, err.stack, statusCode);
};
