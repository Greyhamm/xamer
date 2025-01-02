const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ErrorResponse('Not authorized to access this route', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, secret);
    console.log('Decoded token:', decoded);

    // Get user from token
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new ErrorResponse('User not found', 401);
    }

    // Add user to request object
    req.user = {
      userId: user._id.toString(), // Convert ObjectId to string
      role: user.role,
      username: user.username
    };

    console.log('Authenticated user:', req.user);
    next();
  } catch (err) {
    console.error('Auth error:', err);
    throw new ErrorResponse('Not authorized to access this route', 401);
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ErrorResponse(
        `User role ${req.user.role} is not authorized to access this route`,
        403
      );
    }
    next();
  };
};