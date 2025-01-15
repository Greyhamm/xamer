const express = require('express');
const router = express.Router();
const SubmissionController = require('../controllers/SubmissionController');
const { protect, authorize } = require('../middleware/auth');

router.post(
  '/exams/:examId/submit',
  protect,
  authorize('student'),
  SubmissionController.submitExam
);

router.get(
  '/submissions',
  protect,
  SubmissionController.getSubmissions
);

router.get(
  '/submissions/:id',
  protect,
  SubmissionController.getSubmission
);
// Ensure this route is properly defined
router.get(
  '/submissions', 
  protect,  // Ensure authentication middleware is applied
  SubmissionController.getSubmissions  // Make sure this method exists in the controller
);

module.exports = router;
router.post(
  '/submissions/:id/grade',
  protect,
  authorize('teacher'),
  SubmissionController.gradeSubmission
);

module.exports = router;