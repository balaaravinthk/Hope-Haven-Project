import { sendError } from '../utils/apiResponse.js';

/**
 * Role-Based Access Control (RBAC) middleware
 * @param  {...string} allowedRoles ('supporter', 'orphanage', 'admin')
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
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
