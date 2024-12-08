// backend/models/Question.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  type: { type: String, required: true, enum: ['MultipleChoice', 'Written', 'Coding'] },
});

module.exports = QuestionSchema;
