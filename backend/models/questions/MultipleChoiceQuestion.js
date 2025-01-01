const mongoose = require('mongoose');
const Question = require('../base/BaseQuestion');

const MultipleChoiceQuestionSchema = new mongoose.Schema({
  options: { 
    type: [String], 
    required: [true, 'Options are required'],
    validate: {
      validator: function(v) {
        return v.length >= 2;
      },
      message: 'At least two options are required'
    }
  },
  correctOption: { 
    type: Number, 
    required: [true, 'Correct option is required'],
    validate: {
      validator: function(v) {
        return v >= 0 && v < this.options.length;
      },
      message: 'Correct option must be a valid index'
    }
  }
});

// Check if the discriminator already exists
module.exports = mongoose.models['MultipleChoice'] || 
  Question.discriminator('MultipleChoice', MultipleChoiceQuestionSchema);