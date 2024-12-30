const express = require('express');
const router = express.Router();
const ExamController = require('../controllers/ExamController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, ExamController.getExams)
  .post(protect, authorize('teacher'), ExamController.createExam);

router
  .route('/:id')
  .get(protect, ExamController.getExam)
  .put(protect, authorize('teacher'), ExamController.updateExam)
  .delete(protect, authorize('teacher'), ExamController.deleteExam);

router.put(
  '/:id/publish',
  protect,
  authorize('teacher'),
  ExamController.publishExam
);

module.exports = router;