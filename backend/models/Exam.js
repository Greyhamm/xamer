mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Please provide an exam title'],
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    default: null
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  timeLimit: {
    type: Number,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Track population state using query options
ExamSchema.pre(/^find/, function(next) {
  // Skip if this is a nested population
  if (this.options?._recursed) {
    return next();
  }

  // Mark as recursed to prevent infinite loops
  this.options._recursed = true;

  this.populate({
    path: 'questions',
    select: '-__v'
  });

  this.populate({
    path: 'creator',
    select: 'username'
  });

  // Only populate basic class info without its exams
  this.populate({
    path: 'class',
    select: 'name description teacher',
    options: { _recursed: true }
  });

  next();
});

// Add a pre-save middleware to log class information
ExamSchema.pre('save', function(next) {
  console.log('Exam pre-save middleware running with data:', {
    examId: this._id,
    title: this.title,
    classId: this.class,
    status: this.status
  });
  next();
});

module.exports = mongoose.model('Exam', ExamSchema);