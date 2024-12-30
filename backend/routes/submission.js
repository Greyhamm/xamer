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

router.post(
  '/submissions/:id/grade',
  protect,
  authorize('teacher'),
  SubmissionController.gradeSubmission
);

module.exports = router;