import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';
import { User } from '../models/User.js';

/**
 * Protect routes by extracting and validating JWT Bearer token
 * Attaches the authenticated MongoDB user record to req.user
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(
      res,
      'Authentication required. No Bearer token provided.',
      null,
      401
    );
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return sendError(
      res,
      'Authentication required. Bearer token is empty.',
      null,
      401
    );
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Hydrate user from MongoDB (excluding password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(
        res,
        'Authentication failed. User belonging to this token no longer exists.',
        null,
        401
      );
    }

    // Attach active user document to the request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(
        res,
        'Token has expired. Please log in again.',
        null,
        401
      );
    }

    if (error.name === 'JsonWebTokenError') {
      return sendError(
        res,
        'Invalid or malformed token. Authentication failed.',
        null,
        401
      );
    }

    return sendError(
      res,
      'Authentication error.',
      error.message,
      401
    );
  }
};

/**
 * Optional authentication: hydrates req.user if a valid token is present,
 * but allows unauthenticated requests to proceed.
 */
export const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
    }
  } catch {
    // Ignore invalid/expired token in optional auth
  }

  next();
};

export default authenticate;
