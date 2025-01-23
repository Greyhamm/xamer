// backend/models/ExamLog.js
const mongoose = require('mongoose');

const ExamLogSchema = new mongoose.Schema({
  examId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Exam', 
    required: true 
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sessionId: {
    type: String,
    required: true
  },
  eventType: { 
    type: String, 
    required: true,
    enum: [
      'EXAM_STARTED', 
      'EXAM_ENDED', 
      'WINDOW_SWITCH', 
      'APPLICATION_DETECTION', 
      'SCREENSHOT_ATTEMPT',
      'VIEW_CHANGE',
      'SYSTEM_VIOLATION'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexing for performance
ExamLogSchema.index({ examId: 1, studentId: 1, timestamp: -1 });
ExamLogSchema.index({ sessionId: 1, timestamp: -1 });

module.exports = mongoose.model('ExamLog', ExamLogSchema);