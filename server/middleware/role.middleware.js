const { error } = require('../utils/apiResponse.util');

/**
 * Middleware factory: restrict access to specific role(s).
 * Must be used AFTER requireAuth.
 *
 * Usage:
 *   router.use(requireAuth, requireRole('admin'))
 *   router.use(requireAuth, requireRole('admin', 'store_owner'))
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentication required.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return error(
        res,
        `Access denied. Required role: ${roles.join(' or ')}.`,
        403
      );
    }

    next();
  };
};

module.exports = { requireRole };
