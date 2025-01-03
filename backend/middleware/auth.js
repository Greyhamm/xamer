// Update in backend/middleware/auth.js

const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new ErrorResponse('Not authorized to access this route', 401);
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, secret);
        
        // Get user
        const user = await User.findById(decoded.userId);
        if (!user) {
            throw new ErrorResponse('User not found', 401);
        }

        // Add user info to request
        req.user = {
            userId: user._id.toString(),  // Ensure userId is a string
            role: user.role,
            username: user.username
        };

        console.log('Auth middleware - User authenticated:', {
            userId: req.user.userId,
            role: req.user.role
        });

        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        throw new ErrorResponse('Not authorized to access this route', 401);
    }
});

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ErrorResponse(
                `User role ${req.user.role} is not authorized to access this route`,
                403
            );
        }
        console.log('Role authorization successful:', {
            role: req.user.role,
            allowedRoles: roles
        });
        next();
    };
};