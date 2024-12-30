const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { protect } = require('../middleware/auth');

router.post('/signup', AuthController.register);
router.post('/login', AuthController.login);
router.get('/profile', protect, AuthController.getProfile);

module.exports = router;