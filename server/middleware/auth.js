const { verifyAccessToken } = require('../utils/jwt');
const { ApiError } = require('./errorHandler');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

/**
 * Verifies the Bearer JWT and attaches the full user document to req.user.
 * Rejects if the token is missing/invalid or the account has been deactivated.
 */
const authenticateUser = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired authentication token');
  }

  const user = await User.findById(payload.sub);

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Account not found or deactivated');
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to specific roles. Always used AFTER authenticateUser.
 * Never trusts any role claim sent from the frontend — only req.user.role,
 * which came from the verified JWT + a fresh DB lookup above.
 */
const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, 'You do not have permission to perform this action');
  }

  next();
};

module.exports = { authenticateUser, authorizeRoles };
