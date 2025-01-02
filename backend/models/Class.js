const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a class name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam'
  }],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update the pre-find middleware to properly handle the teacher reference
ClassSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'teacher',
    select: 'username _id'
  });
  next();
});

// Add method to get teacher ID safely
ClassSchema.methods.getTeacherId = function() {
  if (this.teacher._id) {
    return this.teacher._id.toString();
  }
  return this.teacher.toString();
};

module.exports = mongoose.model('Class', ClassSchema);