const Exam = require('../models/Exam');
const ExamSubmission = require('../models/ExamSubmission');
const mongoose = require('mongoose');
const QuestionSchema = require('../models/Question');
const Question = mongoose.model('Question', QuestionSchema);
const ValidationService = require('../services/ValidationService');
const ErrorResponse = require('../utils/errorResponse');

class ExamController {
    // Create new exam
    async createExam(req) {
        try {
            const { title, questions, userData } = req.body;
            
            if (!title || !questions || !userData) {
                throw new ErrorResponse('Title, questions, and user data are required', 400);
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
                        prompt: q.prompt,
                        type: q.type,
                        options: q.options,
                        correctOption: q.correctOption,
                        media: q.media
                    };
                    return await Question.create(questionData);
                })
            );

            // Create exam with question references
            const examData = {
                title,
                creator: userData.userId,
                status: req.body.status || 'draft',
                questions: questionDocs.map(q => q._id)
            };

            const exam = await Exam.create(examData);

            // Populate the exam with question data
            const populatedExam = await Exam.findById(exam._id)
                .populate('questions')
                .populate('creator', 'username')
                .lean(); // Convert to plain JavaScript object

            return populatedExam;
        } catch (error) {
            console.error('Create exam error:', error);
            throw new ErrorResponse(error.message || 'Failed to create exam', 500);
        }
    }

    async getStats(req) {
        try {
            const stats = await Promise.all([
                Exam.countDocuments({ creator: req.user.userId }),
                Exam.countDocuments({ creator: req.user.userId, status: 'published' }),
                ExamSubmission.countDocuments({ status: 'submitted' }),
                ExamSubmission.countDocuments()
            ]);

            return {
                totalExams: stats[0],
                publishedExams: stats[1],
                pendingGrading: stats[2],
                totalSubmissions: stats[3]
            };
        } catch (error) {
            throw new ErrorResponse('Failed to fetch exam statistics', 500);
        }
    }

    async getRecentExams(req) {
        try {
            const recentExams = await Exam.find({ creator: req.user.userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('creator', 'username')
                .populate('questions')
                .lean(); // Convert to plain JavaScript object

            return recentExams;
        } catch (error) {
            throw new ErrorResponse('Failed to fetch recent exams', 500);
        }
    }

    async publishExam(req) {
        try {
            const examId = req.params.id || req.body.examId;
            const exam = await Exam.findById(examId);

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
                .populate('creator', 'username')
                .lean(); // Convert to plain JavaScript object

            return populatedExam;
        } catch (error) {
            console.error('Publish exam error:', error);
            throw new ErrorResponse(error.message || 'Failed to publish exam', 500);
        }
    }
}

module.exports = { ExamController };