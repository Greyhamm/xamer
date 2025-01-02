const mongoose = require('mongoose');

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

// Update the populate middleware
ExamSchema.pre(/^find/, function(next) {
  console.log('Exam pre-find middleware running, populating fields...');
  this.populate({
    path: 'questions',
    select: '-__v'
  })
  .populate({
    path: 'creator',
    select: 'username'
  })
  .populate({
    path: 'class',
    select: 'name description'
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