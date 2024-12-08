// backend/routes/codeExecutionRoutes.js
const express = require('express');
const router = express.Router();
const CodeExecutionController = require('../controllers/CodeExecutionController');

router.post('/execute/javascript', CodeExecutionController.executeJavaScript);

// Add routes for other languages as needed

module.exports = router;
