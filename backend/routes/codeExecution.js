const express = require('express');
const router = express.Router();
const CodeExecutionController = require('../controllers/CodeExecutionController');
const { protect } = require('../middleware/auth');

router.post('/execute/javascript', protect, CodeExecutionController.executeJavaScript);
router.post('/execute/python', protect, CodeExecutionController.executePython);
router.post('/execute/java', protect, CodeExecutionController.executeJava);

module.exports = router;