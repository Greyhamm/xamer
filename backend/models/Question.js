const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['image', 'video'] },
  url: { type: String, required: true },
});

const QuestionSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  type: { type: String, required: true, enum: ['MultipleChoice', 'Written', 'Coding'] },
  media: { type: MediaSchema, default: null }, // Add this line
});

module.exports = QuestionSchema;
