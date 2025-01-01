const mongoose = require('mongoose');
const Question = require('../base/BaseQuestion');

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

// Check if the discriminator already exists
module.exports = mongoose.models['Coding'] || 
  Question.discriminator('Coding', CodingQuestionSchema);