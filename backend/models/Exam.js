// backend/models/Exam.js
const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'questionsTypeModel',
    },
  ],
  questionsTypeModel: [
    {
      type: String,
      required: true,
      enum: ['MultipleChoiceQuestion', 'WrittenQuestion', 'CodingQuestion'],
    },
  ],
});

module.exports = mongoose.model('Exam', ExamSchema);
