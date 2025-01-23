// backend/controllers/ExamLogController.js
const ExamLog = require('../models/ExamLog');
const Exam = require('../models/Exam');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');

class ExamLogController {
  // Create exam session log
  createExamSession = asyncHandler(async (req, res) => {
    const { examId } = req.body;
    const studentId = req.user.userId;

    // Verify exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      throw new ErrorResponse('Exam not found', 404);
    }

    // Generate unique session ID
    const sessionId = uuidv4();

    // Create initial exam start log
    const startLog = await ExamLog.create({
      examId,
      studentId,
      sessionId,
      eventType: 'EXAM_STARTED',
      details: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.status(201).json({
      success: true,
      sessionId: sessionId
    });
  });

  logExamEvent = asyncHandler(async (req, res) => {
    const { 
      examId, 
      sessionId, 
      eventType, 
      details 
    } = req.body;
    const studentId = req.user.userId;
  
    // Validate event
    if (!['WINDOW_SWITCH', 'APPLICATION_DETECTION', 'SCREENSHOT_ATTEMPT', 'VIEW_CHANGE', 'SYSTEM_VIOLATION'].includes(eventType)) {
      throw new ErrorResponse('Invalid event type', 400);
    }
  
    const log = await ExamLog.create({
      examId,
      studentId,
      sessionId,
      eventType,
      details
    });
  
    res.status(201).json({ 
      success: true,
      data: log
    });
  });

  // End exam session
  endExamSession = asyncHandler(async (req, res) => {
    const { examId, sessionId } = req.body;
    const studentId = req.user.userId;

    await ExamLog.create({
      examId,
      studentId,
      sessionId,
      eventType: 'EXAM_ENDED',
      details: {
        reason: 'Normal completion'
      }
    });

    res.status(200).json({ success: true });
  });

  // Get exam logs (for teacher review)
  getExamLogs = asyncHandler(async (req, res) => {
    const { examId } = req.params;

    // Verify user is the exam creator
    const exam = await Exam.findById(examId);
    if (!exam || exam.creator.toString() !== req.user.userId) {
      throw new ErrorResponse('Not authorized', 403);
    }

    const logs = await ExamLog.find({ examId })
      .sort({ timestamp: 1 })
      .populate('studentId', 'username');

    res.status(200).json({
      success: true,
      data: logs
    });
  });
}

module.exports = new ExamLogController();