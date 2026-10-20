import { sendError } from '../utils/apiResponse.js';

/**
 * Role-Based Access Control (RBAC) middleware
 * Restricts access to users having one of the specified roles: 'supporter', 'orphanage', 'admin'
 * 
 * @param  {...(string|string[])} roles Allowed roles
 * @returns {Function} Express middleware function
 */
export const authorizeRoles = (...roles) => {
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return sendError(
        res,
        'Authentication required. No authenticated user found.',
        null,
        401
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`,
        null,
        403
      );
    }

    next();
  };
};

// Aliases and convenience role middlewares
export const requireRoles = authorizeRoles;
export const requireAdmin = authorizeRoles('admin');
export const requireOrphanage = authorizeRoles('orphanage', 'admin');
export const requireSupporter = authorizeRoles('supporter', 'admin');

export default authorizeRoles;
