const mongoose = require('mongoose');
const BaseQuestionSchema = require('../base/BaseQuestion');

const CodingQuestionSchema = new mongoose.Schema({
  language: { 
    type: String, 
    required: true, 
    enum: ['javascript', 'python', 'java'] 
  },
  initialCode: { 
    type: String, 
    default: '' 
  },
  testCases: [{
    input: String,
    expectedOutput: String,
    points: Number
  }]
});

const Question = mongoose.model('Question', BaseQuestionSchema);
module.exports = Question.discriminator('Coding', CodingQuestionSchema);