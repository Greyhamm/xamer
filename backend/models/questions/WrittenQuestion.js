const mongoose = require('mongoose');
const Question = require('../base/BaseQuestion');

const WrittenQuestionSchema = new mongoose.Schema({
  maxWords: {
    type: Number,
    default: null
  },
  rubric: {
    type: String,
    default: null
  }
});

// Check if the discriminator already exists
module.exports = mongoose.models['Written'] || 
  Question.discriminator('Written', WrittenQuestionSchema);