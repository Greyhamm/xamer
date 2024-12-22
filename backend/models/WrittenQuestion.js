const mongoose = require('mongoose');
const QuestionSchema = require('./Question');

const WrittenQuestionSchema = new mongoose.Schema({
  ...QuestionSchema.obj,
  // Add additional fields if necessary
});

module.exports = mongoose.model('WrittenQuestion', WrittenQuestionSchema);
