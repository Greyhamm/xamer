// backend/controllers/ExamController.js
const Exam = require('../models/Exam');
const Class = require('../models/Class'); // Add this import
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
            const { title, questions, userData, classId } = req.body; // Add classId to destructuring
            
            if (!title || !questions || !userData) {
                throw new ErrorResponse('Title, questions, and user data are required', 400);
            }

            // If classId is provided, verify the class exists and user has access
            if (classId) {
                const classDoc = await Class.findById(classId);
                if (!classDoc) {
                    throw new ErrorResponse('Class not found', 404);
                }
                if (classDoc.teacher.toString() !== userData.userId) {
                    throw new ErrorResponse('Not authorized to create exam for this class', 403);
                }
            }
    
            // Validate exam
            const validationErrors = ValidationService.validateExam({ title, questions });
            if (validationErrors.length > 0) {
                throw new ErrorResponse(validationErrors.join(', '), 400);
            }
    
            // Import question models
            const Question = require('../models/base/BaseQuestion');
            const MultipleChoiceQuestion = require('../models/questions/MultipleChoiceQuestion');
            const WrittenQuestion = require('../models/questions/WrittenQuestion');
            const CodingQuestion = require('../models/questions/CodingQuestion');
    
            // Create questions first
            const questionDocs = await Promise.all(
                questions.map(async (q) => {
                    let questionModel;
                    switch (q.type) {
                        case 'MultipleChoice':
                            questionModel = MultipleChoiceQuestion;
                            break;
                        case 'Written':
                            questionModel = WrittenQuestion;
                            break;
                        case 'Coding':
                            questionModel = CodingQuestion;
                            break;
                        default:
                            throw new ErrorResponse(`Unsupported question type: ${q.type}`, 400);
                    }
    
                    const questionData = {
                        prompt: q.prompt,
                        type: q.type,
                        media: q.media
                    };
    
                    // Add type-specific fields
                    if (q.type === 'MultipleChoice') {
                        questionData.options = q.options;
                        questionData.correctOption = q.correctOption;
                    } else if (q.type === 'Coding') {
                        questionData.language = q.language;
                        questionData.initialCode = q.initialCode;
                    } else if (q.type === 'Written') {
                        questionData.maxWords = q.maxWords;
                        questionData.rubric = q.rubric;
                    }
    
                    return await questionModel.create(questionData);
                })
            );
    
            // Create exam with question references
            const examData = {
                title,
                creator: userData.userId,
                status: req.body.status || 'draft',
                questions: questionDocs.map(q => q._id),
                class: classId // Add class reference if provided
            };
    
            const exam = await Exam.create(examData);

            // If class is provided, add exam to class
            if (classId) {
                await Class.findByIdAndUpdate(classId, {
                    $push: { exams: exam._id }
                });
            }
    
            // Populate the exam with question data
            const populatedExam = await Exam.findById(exam._id)
                .populate({
                    path: 'questions',
                    populate: { path: '_id' }
                })
                .populate('creator', 'username')
                .populate('class', 'name') // Add class population
                .lean();
    
            return populatedExam;
        } catch (error) {
            console.error('Create exam error:', error);
            throw new ErrorResponse(error.message || 'Failed to create exam', 500);
        }
    }

    async getStats(req) {
        try {
            const userId = req.user?.userId || req.body?.userData?.userId;
            if (!userId) {
                // Return default stats if no user ID
                return {
                    totalExams: 0,
                    publishedExams: 0,
                    pendingGrading: 0,
                    totalSubmissions: 0
                };
            }
    
            let query = { creator: userId };
            const classId = req.query?.classId;
            if (classId) {
                query.class = classId;
            }
    
            const [totalExams, publishedExams, submittedExams, totalSubmissions] = await Promise.all([
                Exam.countDocuments(query),
                Exam.countDocuments({ ...query, status: 'published' }),
                ExamSubmission.countDocuments({ status: 'submitted' }),
                ExamSubmission.countDocuments()
            ]);
    
            return {
                totalExams: totalExams || 0,
                publishedExams: publishedExams || 0,
                pendingGrading: submittedExams || 0,
                totalSubmissions: totalSubmissions || 0
            };
        } catch (error) {
            console.error('Get stats error:', error);
            // Return default stats on error
            return {
                totalExams: 0,
                publishedExams: 0,
                pendingGrading: 0,
                totalSubmissions: 0
            };
        }
    }
    
    async getRecentExams(req) {
        try {
            const userId = req.user?.userId || req.body?.userData?.userId;
            if (!userId) {
                return [];
            }
    
            let query = { creator: userId };
            const classId = req.query?.classId;
            if (classId) {
                query.class = classId;
            }
    
            const recentExams = await Exam.find(query)
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('creator', 'username')
                .populate('questions')
                .lean();
    
            return recentExams || [];
        } catch (error) {
            console.error('Get recent exams error:', error);
            return [];
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
                .populate('class', 'name')
                .lean();

            return populatedExam;
        } catch (error) {
            console.error('Publish exam error:', error);
            throw new ErrorResponse(error.message || 'Failed to publish exam', 500);
        }
    }
}

module.exports = { ExamController };
