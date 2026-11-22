import { ApiError } from './errorMiddleware.js';

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} allowedRoles Allowed user roles ('student', 'operator', 'admin')
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access restricted: requires one of [${allowedRoles.join(', ')}] role. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
}

/**
 * Operator Service Verification Middleware
 * Ensures an operator only manages their assigned campus service (e.g., 'canteen', 'printing')
 * Admins are permitted oversight across all services.
 * @param {string} requiredService
 */
export function requireOperatorService(requiredService) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    // Admins have oversight
    if (req.user.role === 'admin') {
      return next();
    }

    if (req.user.role === 'operator') {
      if (req.user.operator_service === requiredService || req.user.operator_service === 'general') {
        return next();
      }
    }

    return next(
      ApiError.forbidden(
        `Access denied: operation requires ${requiredService} service operator privileges.`
      )
    );
  };
}

/**
 * Record Ownership Protection Helper
 * Allows operation if the user is an admin or is the owner of the record
 * @param {number|string} recordOwnerId
 * @param {object} currentUser
 */
export function assertOwnershipOrAdmin(recordOwnerId, currentUser) {
  if (!currentUser) return false;
  if (currentUser.role === 'admin') return true;
  return Number(recordOwnerId) === Number(currentUser.id);
}
