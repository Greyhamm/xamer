// backend/models/ExamSubmission.js
const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  questionType: {
    type: String,
    required: true,
    enum: ['MultipleChoice', 'Written', 'Coding']
  },
  answer: mongoose.Schema.Types.Mixed,
  selectedOption: Number,
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
  status: {
    type: String,
    enum: ['submitted', 'graded'],
    default: 'submitted'
  },
  totalScore: {
    type: Number,
    default: null
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