const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcrypt');

class AuthController {
  // @desc    Register user
  // @route   POST /api/auth/signup
  // @access  Public
  register = asyncHandler(async (req, res) => {
    console.log('Received registration request');
    
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

    // Hash password with a cost factor of 10
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Creating user with hashed password');
    
    // Create user with hashed password
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role
    });

    // Generate JWT Token
    const token = user.getSignedJwtToken();

    // Log success but don't log sensitive data
    console.log('User created successfully:', {
      id: user._id,
      username: user.username,
      role: user.role
    });

    // Send response
    res.status(201).json({
      success: true,
      token,
      userId: user._id.toString(),
      role: user.role,
      username: user.username
    });
  });


  // @desc    Login user
  // @route   POST /api/auth/login
  // @access  Public
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // Validate email and password
    if (!email || !password) {
      throw new ErrorResponse('Please provide an email and password', 400);
    }

    try {
      // Find user and explicitly select password field
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        console.log('No user found with email:', email);
        throw new ErrorResponse('Invalid credentials', 401);
      }

      // Log password comparison details (but not the actual passwords)
      console.log('Comparing passwords for user:', user._id);
      
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match result:', isMatch);

      if (!isMatch) {
        throw new ErrorResponse('Invalid credentials', 401);
      }

      // Generate token
      const token = user.getSignedJwtToken();
      console.log('Login successful for user:', user._id);

      // Send response
      res.status(200).json({
        success: true,
        token,
        userId: user._id.toString(),
        role: user.role,
        username: user.username
      });
    } catch (error) {
      console.error('Login error:', error);
      throw new ErrorResponse('Invalid credentials', 401);
    }
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