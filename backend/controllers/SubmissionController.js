const ExamSubmission = require('../models/ExamSubmission');
const Exam = require('../models/Exam');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

class SubmissionController {
  // @desc    Submit exam
  // @route   POST /api/exams/:examId/submit
  // @access  Private/Student
  submitExam = asyncHandler(async (req, res) => {
    const { examId } = req.params;
    const { answers } = req.body;

    const exam = await Exam.findOne({
      _id: examId,
      status: 'published'
    });

    if (!exam) {
      throw new ErrorResponse('Exam not found or not published', 404);
    }

    // Check for existing submission
    const existingSubmission = await ExamSubmission.findOne({
      exam: examId,
      student: req.user.userId
    });

    if (existingSubmission) {
      throw new ErrorResponse('You have already submitted this exam', 400);
    }

    // Validate answers format
    if (!Array.isArray(answers)) {
      throw new ErrorResponse('Invalid answers format', 400);
    }

    const submission = await ExamSubmission.create({
      exam: examId,
      student: req.user.userId,
      answers: answers.map(answer => ({
        question: answer.questionId,
        answer: answer.answer,
        timeSpent: answer.timeSpent
      })),
      status: 'submitted',
      submitTime: Date.now()
    });

    res.status(201).json({
      success: true,
      data: submission
    });
  });

  // @desc    Grade submission
  // @route   POST /api/submissions/:id/grade
  // @access  Private/Teacher
  gradeSubmission = asyncHandler(async (req, res) => {
    const submission = await ExamSubmission.findById(req.params.id)
      .populate('exam');

    if (!submission) {
      throw new ErrorResponse('Submission not found', 404);
    }

    // Verify teacher owns the exam
    if (submission.exam.creator.toString() !== req.user.userId) {
      throw new ErrorResponse('Not authorized to grade this submission', 403);
    }

    // Update scores and feedback
    submission.answers = submission.answers.map(answer => {
      const grade = req.body.grades.find(g => g.questionId === answer.question.toString());
      if (grade) {
        answer.score = grade.score;
        answer.feedback = grade.feedback;
      }
      return answer;
    });

    submission.status = 'graded';
    submission.gradedBy = req.user.userId;
    submission.gradedAt = Date.now();

    await submission.save();

    res.status(200).json({
      success: true,
      data: submission
    });
  });

  // @desc    Get all submissions
  // @route   GET /api/submissions
  // @access  Private
// backend/controllers/SubmissionController.js
getSubmissions = asyncHandler(async (req, res) => {
  let query;

  // If teacher, get submissions for their exams
  if (req.user.role === 'teacher') {
    const teacherExams = await Exam.find({ creator: req.user.userId });
    const examIds = teacherExams.map(exam => exam._id);
    query = ExamSubmission.find({ exam: { $in: examIds } });
  } else {
    // If student, get their own submissions
    query = ExamSubmission.find({ student: req.user.userId });
  }

  const submissions = await query
    .populate('exam', 'title')
    .populate('student', 'username email')
    .lean();

  res.status(200).json({
    success: true,
    count: submissions.length,
    data: submissions
  });
});

  // @desc    Get single submission
  // @route   GET /api/submissions/:id
  // @access  Private
  getSubmission = asyncHandler(async (req, res) => {
    const submission = await ExamSubmission.findById(req.params.id)
      .populate('exam')
      .populate('student', 'username email');

    if (!submission) {
      throw new ErrorResponse('Submission not found', 404);
    }

    // Verify user has access
    if (
      req.user.role === 'student' && 
      submission.student._id.toString() !== req.user.userId
    ) {
      throw new ErrorResponse('Not authorized to view this submission', 403);
    }

    if (
      req.user.role === 'teacher' && 
      submission.exam.creator.toString() !== req.user.userId
    ) {
      throw new ErrorResponse('Not authorized to view this submission', 403);
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  });
}

module.exports = new SubmissionController();