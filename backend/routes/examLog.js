// backend/routes/examLog.js
const express = require('express');
const router = express.Router();
const ExamLogController = require('../controllers/ExamLogController');
const { protect, authorize } = require('../middleware/auth');

// Change this from '/exam-logs/log' to '/exam-logs'
router.post('/', 
  protect, 
  authorize('student'), 
  ExamLogController.logExamEvent
);

// Similarly, update other routes
router.post('/start', 
  protect, 
  authorize('student'), 
  ExamLogController.createExamSession
);

router.post('/end', 
  protect, 
  authorize('student'), 
  ExamLogController.endExamSession
);

router.get('/:examId', 
  protect, 
  authorize('teacher'), 
  ExamLogController.getExamLogs
);

module.exports = router;