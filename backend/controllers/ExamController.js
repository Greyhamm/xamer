// backend/controllers/ExamController.js
const Exam = require('../models/Exam');
const Class = require('../models/Class'); // Add this import
const ExamSubmission = require('../models/ExamSubmission');
const mongoose = require('mongoose');
const QuestionSchema = require('../models/Question');
const Question = mongoose.model('Question', QuestionSchema);
const ValidationService = require('../services/ValidationService');
const ErrorResponse = require('../utils/errorResponse');
const MultipleChoiceQuestion = require('../models/questions/MultipleChoiceQuestion');
const WrittenQuestion = require('../models/questions/WrittenQuestion');
const CodingQuestion = require('../models/questions/CodingQuestion');
const asyncHandler = require('../utils/asyncHandler');
class ExamController {
    async createExam(req) {
        try {
            const { title, questions, userData, classId, status } = req.body;
            console.log('Creating exam with data:', { 
                title,
                classId,
                status,
                userId: userData?.userId 
            });
            
            if (!title || !questions || !userData) {
                throw new ErrorResponse('Title, questions, and user data are required', 400);
            }
    
            // Verify class if classId is provided
            let classDoc = null;
            if (classId) {
                console.log('Looking up class:', classId);
                try {
                    classDoc = await Class.findById(classId).populate('teacher', 'username _id');
                    
                    if (!classDoc) {
                        throw new ErrorResponse('Class not found', 404);
                    }
    
                    // Get teacher ID using the safe method or direct access
                    const teacherId = classDoc.teacher._id.toString();
                    const requestUserId = userData.userId.toString();
    
                    console.log('Auth check:', {
                        teacherId,
                        requestUserId,
                        teacherObjectId: classDoc.teacher._id,
                        classId: classDoc._id,
                        className: classDoc.name
                    });
    
                    if (teacherId !== requestUserId) {
                        throw new ErrorResponse('Not authorized to create exam for this class', 403);
                    }
    
                    console.log('Authorization verified for class:', {
                        classId: classDoc._id,
                        className: classDoc.name,
                        teacherId
                    });
                } catch (err) {
                    console.error('Error during class verification:', err);
                    if (err.statusCode === 403) {
                        throw err;
                    }
                    throw new ErrorResponse('Error verifying class access', 500);
                }
            }
    
            // Create exam data
            const examData = {
                title,
                creator: userData.userId,
                status: status || 'draft',
                questions: []
            };
    
            // Only add class if we have a valid classDoc
            if (classDoc) {
                examData.class = classDoc._id;
                console.log('Added class reference to exam:', classDoc._id.toString());
            }
    
            // Create questions
            console.log('Creating exam questions...');
            const questionDocs = await Promise.all(
                questions.map(async (q) => {
                    const questionModel = mongoose.model(q.type);
                    const questionData = {
                        type: q.type,
                        prompt: q.prompt,
                        media: q.media,
                        points: q.points, // Add points
                        ...(q.type === 'MultipleChoice' && {
                            options: q.options,
                            correctOption: q.correctOption
                        }),
                        ...(q.type === 'Coding' && {
                            language: q.language,
                            initialCode: q.initialCode
                        }),
                        ...(q.type === 'Written' && {
                            maxWords: q.maxWords,
                            rubric: q.rubric
                        })
                    };
                    
                    const createdQuestion = await questionModel.create(questionData);
                    console.log(`Created ${q.type} question:`, createdQuestion._id);
                    return createdQuestion;
                })
            );
            examData.questions = questionDocs.map(q => q._id);
    
            // Create exam
            console.log('Creating exam with final data:', {
                ...examData,
                questionCount: examData.questions.length,
                hasClass: !!examData.class
            });
    
            const exam = await Exam.create(examData);
            console.log('Created exam:', exam._id);
    
            // Update class if needed
            if (classDoc) {
                console.log('Updating class with exam reference');
                classDoc.exams.push(exam._id);
                await classDoc.save();
            }
    
            // Return populated exam
            const populatedExam = await Exam.findById(exam._id)
                .populate('questions')
                .populate('creator', 'username')
                .populate('class', 'name')
                .lean();
    
            console.log('Returning populated exam:', {
                id: populatedExam._id,
                title: populatedExam.title,
                classId: populatedExam.class?._id,
                className: populatedExam.class?.name,
                questionCount: populatedExam.questions.length
            });
    
            return populatedExam;
        } catch (error) {
            console.error('Create exam error:', error);
            throw error;
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
            console.log('Publishing exam with data:', req.body);
            const examId = req.params?.id || req.body?.examId;
            const userData = req.body?.userData || req.user;

            if (!examId) {
                throw new ErrorResponse('Exam ID is required', 400);
            }

            console.log('Looking for exam:', examId);
            const exam = await Exam.findById(examId)
                .populate('creator', 'username')
                .populate('class', 'name');

            if (!exam) {
                throw new ErrorResponse('Exam not found', 404);
            }

            // Compare the creator ID with the user ID
            const creatorId = exam.creator._id ? exam.creator._id.toString() : exam.creator.toString();
            const userId = userData.userId.toString();

            console.log('Comparing creator ID:', creatorId, 'with user ID:', userId);

            if (creatorId !== userId) {
                throw new ErrorResponse('Not authorized to publish this exam', 403);
            }

            exam.status = 'published';
            await exam.save();

            console.log('Exam published successfully:', exam);

            // Return populated exam
            const populatedExam = await Exam.findById(exam._id)
                .populate('questions')
                .populate('creator', 'username')
                .populate('class', 'name')
                .lean();

            return {
                success: true,
                data: populatedExam
            };
        } catch (error) {
            console.error('Publish exam error:', error);
            throw error;
        }
    }

    async getExams(req, res, next) {
        try {
            console.log('Getting exams for user:', req.user);
    
            let exams;
            if (req.user.role === 'teacher') {
                // For teachers, get all exams they've created
                exams = await Exam.find({ creator: req.user.userId })
                    .populate('questions')
                    .populate('class', 'name')
                    .lean();
            } else if (req.user.role === 'student') {
                // For students, get published exams
                exams = await Exam.find({ 
                    status: 'published',
                    // Optionally, you might want to filter by class if needed
                    // class: { $in: studentClasses }  // This would require additional logic to get student's classes
                })
                    .populate('questions')
                    .populate('class', 'name')
                    .lean();
            } else {
                throw new ErrorResponse('Invalid user role', 403);
            }
    
            res.status(200).json({
                success: true,
                count: exams.length,
                data: exams
            });
        } catch (error) {
            console.error('Get exams error:', error);
            next(error);
        }
    }

    async getExam(req, res, next) {
        try {
          const examId = req.params.id;
          
          // Determine access based on user role
          let exam;
          if (req.user.role === 'teacher') {
            // Teachers can see any exam they created
            exam = await Exam.findOne({ 
              _id: examId, 
              creator: req.user.userId 
            })
            .populate('questions')
            .populate('class', 'name')
            .lean();
          } else if (req.user.role === 'student') {
            // Students can only see published exams
            exam = await Exam.findOne({ 
              _id: examId, 
              status: 'published' 
            })
            .populate('questions')
            .populate('class', 'name')
            .lean();
          }
      
          if (!exam) {
            return res.status(404).json({
              success: false,
              error: 'Exam not found or not accessible'
            });
          }
      
          res.status(200).json({
            success: true,
            data: exam
          });
        } catch (error) {
          console.error('Get exam error:', error);
          next(error);
        }
      }

      // backend/controllers/ExamController.js

// Add this method to the ExamController class
submitExam = asyncHandler(async (req, res) => {
    const { examId } = req.params;
    const { answers } = req.body;
  
    try {
      // Validate exam exists and is published
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
  
      // Create submission
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
    } catch (error) {
      console.error('Submit exam error:', error);
      throw error;
    }
  });
}



module.exports = { ExamController };
