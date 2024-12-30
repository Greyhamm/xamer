const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

class AuthController {
  // @desc    Register user
  // @route   POST /api/auth/signup
  // @access  Public
  register = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;

    // Validate role
    if (!['student', 'teacher'].includes(role)) {
      throw new ErrorResponse('Invalid role', 400);
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new ErrorResponse('User already exists', 400);
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role
    });

    this.sendTokenResponse(user, 201, res);
  });

  // @desc    Login user
  // @route   POST /api/auth/login
  // @access  Public
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      throw new ErrorResponse('Please provide an email and password', 400);
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ErrorResponse('Invalid credentials', 401);
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new ErrorResponse('Invalid credentials', 401);
    }

    this.sendTokenResponse(user, 200, res);
  });

  // @desc    Get current logged in user
  // @route   GET /api/auth/profile
  // @access  Private
  getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId);
    res.status(200).json({
      success: true,
      data: user
    });
  });

  // Helper method to send token response
  sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    res.status(statusCode).json({
      success: true,
      token,
      role: user.role
    });
  };
}

module.exports = new AuthController();