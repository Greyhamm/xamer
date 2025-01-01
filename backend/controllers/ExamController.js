const Exam = require('../models/Exam');
const ExamSubmission = require('../models/ExamSubmission');
const Question = require('../models/base/BaseQuestion');
const ValidationService = require('../services/ValidationService');
const ErrorResponse = require('../utils/errorResponse');

class ExamController {
  // Create new exam
  createExam = async (req) => {
    const { title, questions } = req.body;

    if (!title || !questions) {
      throw new ErrorResponse('Title and questions are required', 400);
    }

    const validationErrors = ValidationService.validateExam({ title, questions });
    if (validationErrors.length > 0) {
      throw new ErrorResponse(validationErrors.join(', '), 400);
    }

    const questionDocs = await Promise.all(
      questions.map(async (q) => {
        const question = await Question.create(q);
        return question;
      })
    );

    const exam = await Exam.create({
      title,
      creator: req.user.userId,
      questions: questionDocs.map(q => q._id)
    });

    return exam;
  };

  // Get all exams
  getExams = async (req) => {
    let query;

    if (req.user.role === 'teacher') {
      query = Exam.find({ creator: req.user.userId });
    } else {
      query = Exam.find({ status: 'published' });
    }

    const exams = await query.populate('creator', 'username');
    return exams;
  };

  // Get single exam
  getExam = async (req) => {
    const exam = await Exam.findById(req.params.id)
      .populate('creator', 'username')
      .populate('questions');

    if (!exam) {
      throw new ErrorResponse('Exam not found', 404);
    }

    if (exam.status === 'draft' && exam.creator._id.toString() !== req.user.userId) {
      throw new ErrorResponse('Not authorized to access this exam', 403);
    }

    return exam;
  };

  // Update exam
  updateExam = async (req) => {
    let exam = await Exam.findById(req.params.id);

    if (!exam) {
      throw new ErrorResponse('Exam not found', 404);
    }

    if (exam.creator.toString() !== req.user.userId) {
      throw new ErrorResponse('Not authorized to update this exam', 403);
    }

    exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    return exam;
  };

  // Delete exam
  deleteExam = async (req) => {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      throw new ErrorResponse('Exam not found', 404);
    }

    if (exam.creator.toString() !== req.user.userId) {
      throw new ErrorResponse('Not authorized to delete this exam', 403);
    }

    await Question.deleteMany({ _id: { $in: exam.questions } });
    await exam.remove();

    return { success: true };
  };

  // Publish exam
  publishExam = async (req) => {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      throw new ErrorResponse('Exam not found', 404);
    }

    if (exam.creator.toString() !== req.user.userId) {
      throw new ErrorResponse('Not authorized to publish this exam', 403);
    }

    exam.status = 'published';
    await exam.save();

    return exam;
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
      console.error('Error getting stats:', error);
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
      console.error('Error getting recent exams:', error);
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
      console.error('Error getting recent submissions:', error);
      throw new ErrorResponse('Failed to fetch recent submissions', 500);
    }
  };

  // Submit exam
  submitExam = async (req) => {
    const { examId, answers } = req.body;

    const exam = await Exam.findOne({
      _id: examId,
      status: 'published'
    });

    if (!exam) {
      throw new ErrorResponse('Exam not found or not published', 404);
    }

    const existingSubmission = await ExamSubmission.findOne({
      exam: examId,
      student: req.user.userId
    });

    if (existingSubmission) {
      throw new ErrorResponse('You have already submitted this exam', 400);
    }

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

    return submission;
  };

  // Grade submission
  gradeSubmission = async (req) => {
    const submission = await ExamSubmission.findById(req.params.id)
      .populate('exam');

    if (!submission) {
      throw new ErrorResponse('Submission not found', 404);
    }

    if (submission.exam.creator.toString() !== req.user.userId) {
      throw new ErrorResponse('Not authorized to grade this submission', 403);
    }

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

    return submission;
  };
}

module.exports = {
  ExamController
};