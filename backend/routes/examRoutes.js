// backend/routes/examRoutes.js
const express = require('express');
const router = express.Router();
const ExamController = require('../controllers/ExamController');
const { authenticateUser, requireTeacher, requireStudent } = require('../middleware/auth');

// Protected routes with role-based access
router.post('/exams', authenticateUser, requireTeacher, ExamController.createExam);
router.get('/exams', authenticateUser, ExamController.getAllExams);
router.get('/exams/:id', authenticateUser, ExamController.getExamById);
router.post('/exams/:id/publish', authenticateUser, requireTeacher, ExamController.publishExam); // Add this line
router.patch('/exams/:id/status', authenticateUser, requireTeacher, ExamController.updateExamStatus);
router.delete('/exams/:id', authenticateUser, requireTeacher, ExamController.deleteExam);
router.post('/exams/:examId/submit', authenticateUser, requireStudent, ExamController.submitExam);
router.get('/submissions', authenticateUser, ExamController.getSubmissions);
router.post('/submissions/:submissionId/grade', authenticateUser, requireTeacher, ExamController.gradeSubmission);
router.get('/exams/:id/stats', authenticateUser, ExamController.getExamStats);
router.get('/teacher/stats', authenticateUser, requireTeacher, ExamController.getTeacherStats);
router.get('/student/stats', authenticateUser, requireStudent, ExamController.getStudentStats);

module.exports = router;