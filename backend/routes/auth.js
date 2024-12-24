// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticateUser } = require('../middleware/auth');

// Auth routes
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.get('/profile', authenticateUser, AuthController.getProfile);

module.exports = router;