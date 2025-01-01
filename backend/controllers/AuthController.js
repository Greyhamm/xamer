const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcrypt');

class AuthController {
  // @desc    Register user
  // @route   POST /api/auth/signup
  // @access  Public
  register = asyncHandler(async (req, res) => {
    console.log('Received body:', req.body); // Log entire request body

    const { username, email, password, role } = req.body;
    console.log('Received role:', role);

    // Validate role
    if (!['student', 'teacher'].includes(role)) {
      throw new ErrorResponse('Invalid role', 400);
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new ErrorResponse('User already exists', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully.');

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role
    });
    console.log('User created successfully:', user);

    // Generate JWT Token
    const token = user.getSignedJwtToken();
    console.log('JWT token generated:', token);

    // Send response
    res.status(201).json({
      success: true,
      token,
      role: user.role
    });
  });

  // @desc    Login user
  // @route   POST /api/auth/login
  // @access  Public
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });

    // Validate email and password
    if (!email || !password) {
      throw new ErrorResponse('Please provide an email and password', 400);
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ErrorResponse('Invalid credentials', 401);
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ErrorResponse('Invalid credentials', 401);
    }

    // Generate JWT Token
    const token = user.getSignedJwtToken();
    console.log('JWT token generated for login:', token);

    // Send response with user data
    res.status(200).json({
      success: true,
      token,
      userId: user._id.toString(), // Ensure it's a string
      role: user.role,
      username: user.username
    });
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