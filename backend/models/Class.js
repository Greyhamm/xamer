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

// Track population state using query options
ClassSchema.pre(/^find/, function(next) {
  // Skip if this is a nested population
  if (this.options?._recursed) {
    return next();
  }

  // Mark as recursed to prevent infinite loops
  this.options._recursed = true;

  this.populate({
    path: 'teacher',
    select: 'username _id'
  });

  this.populate({
    path: 'students',
    select: 'username email createdAt'
  });

  // Only populate basic exam info without class reference
  this.populate({
    path: 'exams',
    select: 'title status creator',
    options: { _recursed: true }
  });

  next();
});


// Pre-save middleware for logging
ClassSchema.pre('save', function(next) {
  console.log('Class pre-save middleware running:', {
    classId: this._id,
    name: this.name,
    studentCount: this.students?.length || 0
  });
  next();
});

module.exports = mongoose.model('Class', ClassSchema);