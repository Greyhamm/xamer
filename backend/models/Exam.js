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
  this.populate({
    path: 'questions',
    select: '-__v'
  }).populate({
    path: 'class',
    select: 'name',
    options: { strictPopulate: false }
  });
  next();
});


// Calculate total points before saving
ExamSchema.pre('save', async function(next) {
  if (this.isModified('questions')) {
    const Question = mongoose.model('Question');
    const questions = await Question.find({
      _id: { $in: this.questions }
    });
    
    this.totalPoints = questions.reduce((total, question) => {
      return total + (question.points || 0);
    }, 0);
  }
  next();
});

module.exports = mongoose.model('Exam', ExamSchema);