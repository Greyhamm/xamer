const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['image', 'video'] },
  url: { type: String, required: true },
});

const BaseQuestionSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  type: { type: String, required: true },
  media: { type: MediaSchema, default: null },
}, {
  discriminatorKey: 'type',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = BaseQuestionSchema;