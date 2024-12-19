// backend/models/CodingQuestion.js
const mongoose = require('mongoose');
const QuestionSchema = require('./Question');

const CodingQuestionSchema = new mongoose.Schema({
  ...QuestionSchema.obj,
  language: { type: String, required: true, enum: ['javascript', 'python', 'java'] },
  initialCode: { type: String, default: '' }, // Starter code provided by the exam creator
  userCode: { type: String, default: '' },    // Code entered by the participant
});

module.exports = mongoose.model('CodingQuestion', CodingQuestionSchema);
