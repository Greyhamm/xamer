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
        ref: 'Question',
        required: true
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

// Ensure questions are always selected
ExamSchema.pre(/^find/, function(next) {
    if (!this._fields || !this._fields.questions) {
        this.select('+questions');
    }
    next();
});

module.exports = mongoose.model('Exam', ExamSchema);
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