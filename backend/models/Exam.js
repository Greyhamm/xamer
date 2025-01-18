const mongoose = require('mongoose');

// backend/models/Exam.js

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
    timeLimit: {
        type: Number,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Calculate total points as a method instead of a virtual
ExamSchema.methods.calculateTotalPoints = function() {
    if (!this.questions || !Array.isArray(this.questions)) return 0;
    return this.questions.reduce((total, question) => total + (question.points || 0), 0);
};

// Add a pre-save middleware to calculate and store total points
ExamSchema.pre('save', async function(next) {
    if (this.questions && Array.isArray(this.questions)) {
        // Ensure questions are populated
        if (!this.populated('questions')) {
            await this.populate('questions');
        }
        const totalPoints = this.calculateTotalPoints();
        this.set('totalPoints', totalPoints);
    }
    next();
});

// Add pre-find middleware to ensure questions are populated
ExamSchema.pre(/^find/, function(next) {
    if (!this._fields || !this._fields.questions) {
        this.populate('questions');
    }
    next();
});

module.exports = mongoose.model('Exam', ExamSchema);