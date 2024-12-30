const mongoose = require('mongoose');
const BaseQuestionSchema = require('../base/BaseQuestion');

const MultipleChoiceQuestionSchema = new mongoose.Schema({
  options: [{ 
    type: String, 
    required: true 
  }],
  correctOption: { 
    type: Number, 
    required: true,
    validate: {
      validator: function(v) {
        return v >= 0 && v < this.options.length;
      },
      message: 'Correct option must be a valid index'
    }
  }
});

const Question = mongoose.model('Question', BaseQuestionSchema);
module.exports = Question.discriminator('MultipleChoice', MultipleChoiceQuestionSchema);