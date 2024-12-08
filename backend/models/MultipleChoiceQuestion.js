// backend/models/MultipleChoiceQuestion.js
const mongoose = require('mongoose');
const QuestionSchema = require('./Question');

const MultipleChoiceQuestionSchema = new mongoose.Schema({
  ...QuestionSchema.obj,
  options: [{ type: String, required: true }],
  correctOption: { type: Number, required: true },
});

module.exports = mongoose.model('MultipleChoiceQuestion', MultipleChoiceQuestionSchema);
