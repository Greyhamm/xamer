const Exam = require('../models/Exam');
const Question = require('../models/base/BaseQuestion');
const ValidationService = require('../services/ValidationService');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

class ExamController {
  // @desc    Create new exam
  // @route   POST /api/exams
  // @access  Private/Teacher
  createExam = asyncHandler(async (req, res) => {
    const { title, questions } = req.body;

    // Validate exam
    const validationErrors = ValidationService.validateExam({ title, questions });
    if (validationErrors.length > 0) {
      throw new ErrorResponse(validationErrors.join(', '), 400);
    }

    // Create questions
    const questionDocs = await Promise.all(
      questions.map(async (q) => {
        const question = await Question.create(q);
        return question;
      })
    );

    // Create exam
    const exam = await Exam.create({
      title,
      creator: req.user.userId,
      questions: questionDocs.map(q => q._id)
    });

    res.status(201).json({
      success: true,
      data: exam
    });
  });

  // @desc    Get all exams
  // @route   GET /api/exams
  // @access  Private
  getExams = asyncHandler(async (req, res) => {
    let query;

    if (req.user.role === 'teacher') {
      query = Exam.find({ creator: req.user.userId }).populate('creator', 'username');
    } else {
      query = Exam.find({ status: 'published' }).populate('creator', 'username');
    }

    const exams = await query.populate('creator', 'username');

    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams
    });
  });

  // @desc    Get single exam
  // @route   GET /api/exams/:id
  // @access  Private
  getExam = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id).populate('creator', 'username');

    if (!exam) {
      throw new ErrorResponse('Exam not found', 404);
    }

    // Check if user has access to unpublished exam
    if (exam.status === 'draft' && exam.creator._id.toString() !== req.user.userId) {
      throw new ErrorResponse('Not authorized to access this exam', 403);
    }

    res.status(200).json({
      success: true,
      data: exam
    });
  });

  // @desc    Update exam
  // @route   PUT /api/exams/:id
  // @access  Private/Teacher
  updateExam = asyncHandler(async (req, res) => {
    let exam = await Exam.findById(req.params.id);

    if (!exam) {
      throw new ErrorResponse('Exam not found', 404);
    }

    // Make sure user is exam creator
    if (exam.creator.toString() !== req.user.userId) {
      throw new ErrorResponse('Not authorized to update this exam', 403);
    }

    exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: exam
    });
  });

  // @desc    Delete exam
  // @route   DELETE /api/exams/:id
  // @access  Private/Teacher
  deleteExam = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      throw new ErrorResponse('Exam not found', 404);
    }

    // Make sure user is exam creator
    if (exam.creator.toString() !== req.user.userId) {
      throw new ErrorResponse('Not authorized to delete this exam', 403);
    }

    // Delete associated questions
    await Question.deleteMany({ _id: { $in: exam.questions } });

    await exam.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  });

  // @desc    Publish exam
  // @route   PUT /api/exams/:id/publish
  // @access  Private/Teacher
  publishExam = asyncHandler(async (req, res) => {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      throw new ErrorResponse('Exam not found', 404);
    }

    // Make sure user is exam creator
    if (exam.creator.toString() !== req.user.userId) {
      throw new ErrorResponse('Not authorized to publish this exam', 403);
    }

    // Update exam status to published
    exam.status = 'published';
    await exam.save();

    res.status(200).json({
      success: true,
      data: exam
    });
  });

  // Additional Methods for Stats, Recent Exams, and Submissions
  getStats = asyncHandler(async (req, res) => {
    // Implement logic to calculate and return exam stats
    const totalExams = await Exam.countDocuments();
    const publishedExams = await Exam.countDocuments({ status: 'published' });
    const pendingGrading = await Exam.countDocuments({ status: 'pendingGrading' });
    const totalSubmissions = await Submission.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalExams,
        publishedExams,
        pendingGrading,
        totalSubmissions
      }
    });
  });

  getRecentExams = asyncHandler(async (req, res) => {
    // Implement logic to fetch recent exams, e.g., last 5 created
    const recentExams = await Exam.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('creator', 'username');

    res.status(200).json({
      success: true,
      data: recentExams
    });
  });

  getRecentSubmissions = asyncHandler(async (req, res) => {
    // Implement logic to fetch recent submissions, e.g., last 5
    const recentSubmissions = await Submission.find()
      .sort({ submittedAt: -1 })
      .limit(5)
      .populate('exam', 'title')
      .populate('student', 'username');

    res.status(200).json({
      success: true,
      data: recentSubmissions
    });
  });
}

module.exports = new ExamController();