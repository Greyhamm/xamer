// backend/routes/examRoutes.js
const express = require('express');
const router = express.Router();
const ExamController = require('../controllers/ExamController');

// Create a new exam
router.post('/exams', ExamController.createExam);

// Get all exams
router.get('/exams', ExamController.getAllExams);

// Get a specific exam by ID
router.get('/exams/:id', ExamController.getExamById);

module.exports = router;
