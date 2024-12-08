// backend/controllers/ExamController.js
const Exam = require('../models/Exam');
const MultipleChoiceQuestion = require('../models/MultipleChoiceQuestion');
const WrittenQuestion = require('../models/WrittenQuestion');
const CodingQuestion = require('../models/CodingQuestion');

class ExamController {
  // Create a new exam
  static async createExam(req, res) {
    try {
      const { title, questions } = req.body;
      const exam = new Exam({ title, questionsTypeModel: [] });

      for (const q of questions) {
        let question;
        switch (q.type) {
          case 'MultipleChoice':
            question = new MultipleChoiceQuestion(q);
            break;
          case 'Written':
            question = new WrittenQuestion(q);
            break;
          case 'Coding':
            question = new CodingQuestion(q);
            break;
          default:
            return res.status(400).json({ message: `Unknown question type: ${q.type}` });
        }
        await question.save();
        exam.questions.push(question._id);
        exam.questionsTypeModel.push(question.constructor.modelName);
      }

      await exam.save();
      res.status(201).json({ message: 'Exam created successfully', exam });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  }

  // Get all exams
  static async getAllExams(req, res) {
    try {
      const exams = await Exam.find().populate('questions');
      res.status(200).json(exams);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  }

  // Get a specific exam by ID
  static async getExamById(req, res) {
    try {
      const { id } = req.params;
      const exam = await Exam.findById(id).populate('questions');
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      res.status(200).json(exam);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  }
}

module.exports = ExamController;
