const express = require('express');
const router = express.Router();
const { ExamController } = require('../controllers/ExamController');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

// Initialize controller
const examController = new ExamController();

router
  .route('/exams')
  .get(protect, (req, res, next) => examController.getExams(req, res, next))
  .post(
    protect, 
    authorize('teacher'), 
    (req, res, next) => examController.createExam(req, res, next)
  );

router
  .route('/exams/:id')
  .get(protect, (req, res, next) => examController.getExam(req, res, next))
  .put(
    protect, 
    authorize('teacher'), 
    (req, res, next) => examController.updateExam(req, res, next)
  )
  .delete(
    protect, 
    authorize('teacher'), 
    (req, res, next) => examController.deleteExam(req, res, next)
  );

router.put(
  '/exams/:id/publish',
  protect,
  authorize('teacher'),
  (req, res, next) => examController.publishExam(req, res, next)
);

router.get(
  '/exams/stats',
  protect,
  (req, res, next) => examController.getStats(req, res, next)
);

router.get(
  '/exams/recent',
  protect,
  (req, res, next) => examController.getRecentExams(req, res, next)
);



router.post(
  '/exams/:id/submit',
  protect,
  authorize('student'),
  (req, res, next) => examController.submitExam(req, res, next)
);

router.post(
  '/exams/submissions/:id/grade',
  protect,
  authorize('teacher'),
  (req, res, next) => examController.gradeSubmission(req, res, next)
);

module.exports = router;