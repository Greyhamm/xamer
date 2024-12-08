// backend/models/CodingQuestion.js
const mongoose = require('mongoose');
const QuestionSchema = require('./Question');

const CodingQuestionSchema = new mongoose.Schema({
  ...QuestionSchema.obj,
  language: { type: String, required: true, enum: ['javascript', 'python', 'java'] },
  code: { type: String, required: true },
});

module.exports = mongoose.model('CodingQuestion', CodingQuestionSchema);
