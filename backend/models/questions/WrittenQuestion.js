const mongoose = require('mongoose');
const BaseQuestionSchema = require('../base/BaseQuestion');

const WrittenQuestionSchema = new mongoose.Schema({
  maxWords: {
    type: Number,
    default: null
  }
});

const Question = mongoose.model('Question', BaseQuestionSchema);
module.exports = Question.discriminator('Written', WrittenQuestionSchema);