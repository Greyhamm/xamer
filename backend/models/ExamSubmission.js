const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  answer: mongoose.Schema.Types.Mixed,
  score: {
    type: Number,
    default: null
  },
  feedback: String,
  timeSpent: Number // Time spent on this question in seconds
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
    enum: ['in_progress', 'submitted', 'graded'],
    default: 'in_progress'
  },
  totalScore: {
    type: Number,
    default: null
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  submitTime: Date,
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate total score when grading
ExamSubmissionSchema.pre('save', function(next) {
  if (this.isModified('answers')) {
    const gradedAnswers = this.answers.filter(answer => answer.score !== null);
    
    if (gradedAnswers.length === this.answers.length) {
      // Calculate percentage based on points earned vs total points
      const totalPoints = this.answers.reduce((total, answer) => {
        return total + answer.question.points;
      }, 0);
      
      const earnedPoints = gradedAnswers.reduce((total, answer) => {
        return total + answer.score;
      }, 0);

      this.totalScore = Math.round((earnedPoints / totalPoints) * 100);
      this.status = 'graded';
      this.gradedAt = Date.now();
    }
  }
  next();
});

module.exports = mongoose.model('ExamSubmission', ExamSubmissionSchema);