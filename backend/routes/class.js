const express = require('express');
const router = express.Router();
const ClassController = require('../controllers/ClassController');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/classes')
  .get(protect, authorize('teacher'), ClassController.getClasses)
  .post(protect, authorize('teacher'), ClassController.createClass);

// Add route for getting a single class
router.get(
  '/classes/:classId',
  protect,
  authorize('teacher'),
  ClassController.getClass
);

router.post(
  '/classes/:classId/exams/:examId',
  protect,
  authorize('teacher'),
  ClassController.addExamToClass
);

router.post(
  '/classes/:classId/students',
  protect,
  authorize('teacher'),
  ClassController.addStudentToClass
);

module.exports = router;