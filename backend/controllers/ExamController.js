const Exam = require('../models/Exam');
const ExamSubmission = require('../models/ExamSubmission');
// Fix the Question model import
const mongoose = require('mongoose');
const QuestionSchema = require('../models/Question');
const Question = mongoose.model('Question', QuestionSchema);
const ValidationService = require('../services/ValidationService');
const ErrorResponse = require('../utils/errorResponse');

class ExamController {
  // Create new exam
  createExam = async (req) => {
    try {
        const { title, questions, creator } = req.body;

        if (!title || !questions) {
            throw new ErrorResponse('Title and questions are required', 400);
        }

        if (!creator) {
            throw new ErrorResponse('Creator is required', 400);
        }

        // Validate exam
        const validationErrors = ValidationService.validateExam({ title, questions });
        if (validationErrors.length > 0) {
            throw new ErrorResponse(validationErrors.join(', '), 400);
        }

        // Create questions first
        const questionDocs = await Promise.all(
            questions.map(async (q) => {
                const questionData = {
                    ...q,
                    type: q.type || 'MultipleChoice'
                };
                return await Question.create(questionData);
            })
        );

        // Create exam with question references
        const examData = {
            title,
            creator, // This should now be properly set
            status: req.body.status || 'draft',
            questions: questionDocs.map(q => q._id)
        };

        console.log('Creating exam with data:', examData);

        const exam = await Exam.create(examData);

        // Populate the exam with question data
        const populatedExam = await Exam.findById(exam._id)
            .populate('questions')
            .populate('creator', 'username');

        return populatedExam;
    } catch (error) {
        console.error('Create exam error:', error);
        throw new ErrorResponse(error.message || 'Failed to create exam', 500);
    }
};

  // Get exam statistics
  getStats = async (req) => {
    try {
      const [totalExams, publishedExams, pendingGrading, totalSubmissions] = await Promise.all([
        Exam.countDocuments({ creator: req.user.userId }),
        Exam.countDocuments({ creator: req.user.userId, status: 'published' }),
        ExamSubmission.countDocuments({ status: 'submitted' }),
        ExamSubmission.countDocuments()
      ]);

      return {
        totalExams,
        publishedExams,
        pendingGrading,
        totalSubmissions
      };
    } catch (error) {
      throw new ErrorResponse('Failed to fetch exam statistics', 500);
    }
  };

  // Get recent exams
  getRecentExams = async (req) => {
    try {
      const recentExams = await Exam.find({ creator: req.user.userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('creator', 'username')
        .populate('questions');

      return recentExams;
    } catch (error) {
      throw new ErrorResponse('Failed to fetch recent exams', 500);
    }
  };

  // Get recent submissions
  getRecentSubmissions = async (req) => {
    try {
      const recentSubmissions = await ExamSubmission.find()
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('exam', 'title')
        .populate('student', 'username');

      return recentSubmissions;
    } catch (error) {
      throw new ErrorResponse('Failed to fetch recent submissions', 500);
    }
  };

  // Publish exam
  publishExam = async (req) => {
    try {
      const exam = await Exam.findById(req.params.id);

      if (!exam) {
        throw new ErrorResponse('Exam not found', 404);
      }

      if (exam.creator.toString() !== req.user.userId) {
        throw new ErrorResponse('Not authorized to publish this exam', 403);
      }

      exam.status = 'published';
      await exam.save();

      const populatedExam = await Exam.findById(exam._id)
        .populate('questions')
        .populate('creator', 'username');

      return populatedExam;
    } catch (error) {
      console.error('Publish exam error:', error);
      throw new ErrorResponse(error.message || 'Failed to publish exam', 500);
    }
  };
}

module.exports = { ExamController };