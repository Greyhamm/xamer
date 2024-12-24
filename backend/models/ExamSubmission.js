// backend/models/ExamSubmission.js
const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  answer: mongoose.Schema.Types.Mixed,
  score: Number,
  feedback: String
});

const ExamSubmissionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [AnswerSchema],
  totalScore: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['submitted', 'graded'],
    default: 'submitted'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: Date
});

module.exports = mongoose.model('ExamSubmission', ExamSubmissionSchema);