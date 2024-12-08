// backend/routes/codeExecutionRoutes.js
const express = require('express');
const router = express.Router();
const CodeExecutionController = require('../controllers/CodeExecutionController');

// Route for executing JavaScript code
router.post('/execute/javascript', CodeExecutionController.executeJavaScript);

// Route for executing Python code
router.post('/execute/python', CodeExecutionController.executePython);

// Route for executing Java code
router.post('/execute/java', CodeExecutionController.executeJava);

// Add routes for other languages as needed

module.exports = router;
