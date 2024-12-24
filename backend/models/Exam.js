// backend/models/Exam.js
const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'questionsTypeModel',
    },
  ],
  questionsTypeModel: [
    {
      type: String,
      required: true,
      enum: ['MultipleChoiceQuestion', 'WrittenQuestion', 'CodingQuestion'],
    },
  ],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'  // Changed default to published for now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add a pre-save middleware to ensure status is set
ExamSchema.pre('save', function(next) {
  if (!this.status) {
    this.status = 'published';
  }
  next();
});

module.exports = mongoose.model('Exam', ExamSchema);