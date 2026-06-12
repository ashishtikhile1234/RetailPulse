const { verifyToken } = require('../utils/jwt.util');
const { User } = require('../models');
const { error } = require('../utils/apiResponse.util');

/**
 * Middleware: Verify JWT and attach user to req.user.
 * Rejects if token is missing, invalid, or expired.
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Authentication required. Please log in.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Fetch fresh user data (ensures deactivated/deleted users are rejected)
    const user = await User.unscoped().findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return error(res, 'User no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Session expired. Please log in again.', 401);
    }
    return error(res, 'Invalid authentication token.', 401);
  }
};

module.exports = { requireAuth };
