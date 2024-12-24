// backend/controllers/ExamController.js
const Exam = require('../models/Exam');
const ExamSubmission = require('../models/ExamSubmission');
const MultipleChoiceQuestion = require('../models/MultipleChoiceQuestion');
const WrittenQuestion = require('../models/WrittenQuestion');
const CodingQuestion = require('../models/CodingQuestion');
const mongoose = require('mongoose');

const ExamController = {

// Update these methods in your ExamController

createExam: async (req, res) => {
  try {
    const { title, questions } = req.body;
    console.log('Creating exam with title:', title);
    
    const exam = new Exam({ 
      title, 
      creator: req.user.userId,
      questionsTypeModel: [],
      status: 'published' // Explicitly set status
    });

    console.log('Created exam object:', exam);

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
    console.log('Saved exam:', exam);
    res.status(201).json({ message: 'Exam created successfully', exam });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ message: 'Server Error' });
  }
},

getAllExams: async (req, res) => {
  try {
    console.log('Getting exams for role:', req.user.role);
    let exams;
    if (req.user.role === 'teacher') {
      exams = await Exam.find({ creator: req.user.userId })
        .populate('questions')
        .populate('creator', 'username');
    } else {
      // For students, get all exams
      exams = await Exam.find()
        .populate('questions')
        .populate('creator', 'username');
    }
    
    console.log(`Found ${exams.length} exams:`, exams);
    res.status(200).json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Server Error' });
  }
},

getExamById: async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting exam by id:', id);
    
    const exam = await Exam.findById(id)
      .populate('questions')
      .populate('creator', 'username');
    
    if (!exam) {
      console.log('No exam found with id:', id);
      return res.status(404).json({ message: 'Exam not found' });
    }
    
    console.log('Found exam:', exam);
    res.status(200).json(exam);
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ message: 'Server Error' });
  }
},

  submitExam: async (req, res) => {
    try {
      const { examId } = req.params;
      const { answers } = req.body;

      const exam = await Exam.findOne({ _id: examId, status: 'published' });
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found or not published' });
      }

      const existingSubmission = await ExamSubmission.findOne({
        exam: examId,
        student: req.user.userId
      });

      if (existingSubmission) {
        return res.status(400).json({ message: 'You have already submitted this exam' });
      }

      const submission = new ExamSubmission({
        exam: examId,
        student: req.user.userId,
        answers: answers.map(answer => ({
          questionId: answer.questionId,
          answer: answer.answer
        }))
      });

      await submission.save();
      res.status(201).json({ message: 'Exam submitted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  },

  getSubmissions: async (req, res) => {
    try {
      let submissions;
      if (req.user.role === 'teacher') {
        const teacherExams = await Exam.find({ creator: req.user.userId });
        const examIds = teacherExams.map(exam => exam._id);
        
        submissions = await ExamSubmission.find({ exam: { $in: examIds } })
          .populate('student', 'username email')
          .populate('exam', 'title');
      } else {
        submissions = await ExamSubmission.find({ student: req.user.userId })
          .populate('exam', 'title');
      }
      
      res.status(200).json(submissions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  },

  gradeSubmission: async (req, res) => {
    try {
      const { submissionId } = req.params;
      const { grades } = req.body;

      const submission = await ExamSubmission.findById(submissionId);
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      const exam = await Exam.findById(submission.exam);
      if (exam.creator.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized to grade this exam' });
      }

      submission.answers = submission.answers.map(answer => {
        const grade = grades.find(g => g.questionId === answer.questionId.toString());
        if (grade) {
          answer.score = grade.score;
          answer.feedback = grade.feedback;
        }
        return answer;
      });

      submission.totalScore = submission.answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
      submission.status = 'graded';
      submission.gradedBy = req.user.userId;
      submission.gradedAt = new Date();

      await submission.save();
      res.status(200).json({ message: 'Submission graded successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  },

  updateExamStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const exam = await Exam.findOne({ _id: id, creator: req.user.userId });
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      exam.status = status;
      await exam.save();

      res.status(200).json({ message: 'Exam status updated successfully', exam });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  },

  deleteExam: async (req, res) => {
    try {
      const { id } = req.params;

      const exam = await Exam.findOne({ _id: id, creator: req.user.userId });
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      const submissions = await ExamSubmission.find({ exam: id });
      if (submissions.length > 0) {
        return res.status(400).json({ message: 'Cannot delete exam with existing submissions' });
      }

      for (let i = 0; i < exam.questions.length; i++) {
        await mongoose.model(exam.questionsTypeModel[i]).findByIdAndDelete(exam.questions[i]);
      }

      await exam.delete();
      res.status(200).json({ message: 'Exam deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  },

  getExamStats: async (req, res) => {
    try {
      const { id } = req.params;

      const exam = await Exam.findById(id);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      if (req.user.role === 'teacher' && exam.creator.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const submissions = await ExamSubmission.find({ exam: id });
      
      const stats = {
        totalSubmissions: submissions.length,
        averageScore: 0,
        highestScore: 0,
        lowestScore: null,
        gradedSubmissions: 0
      };

      if (submissions.length > 0) {
        const scores = submissions
          .filter(sub => sub.status === 'graded')
          .map(sub => sub.totalScore);

        if (scores.length > 0) {
          stats.gradedSubmissions = scores.length;
          stats.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          stats.highestScore = Math.max(...scores);
          stats.lowestScore = Math.min(...scores);
        }
      }

      res.status(200).json(stats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  },

  getTeacherStats: async (req, res) => {
    try {
      const stats = {
        totalExams: 0,
        publishedExams: 0,
        totalSubmissions: 0,
        pendingGrading: 0
      };

      const exams = await Exam.find({ creator: req.user.userId });
      stats.totalExams = exams.length;
      stats.publishedExams = exams.filter(exam => exam.status === 'published').length;

      const examIds = exams.map(exam => exam._id);
      const submissions = await ExamSubmission.find({ exam: { $in: examIds } });
      stats.totalSubmissions = submissions.length;
      stats.pendingGrading = submissions.filter(sub => sub.status === 'submitted').length;

      res.status(200).json(stats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  },

  getStudentStats: async (req, res) => {
    try {
      const stats = {
        totalExamsTaken: 0,
        examsPending: 0,
        averageScore: 0,
        recentResults: []
      };

      const submissions = await ExamSubmission.find({ student: req.user.userId })
        .populate('exam', 'title');

      stats.totalExamsTaken = submissions.length;
      
      const gradedSubmissions = submissions.filter(sub => sub.status === 'graded');
      if (gradedSubmissions.length > 0) {
        stats.averageScore = gradedSubmissions.reduce((acc, sub) => acc + sub.totalScore, 0) / gradedSubmissions.length;
      }

      const publishedExams = await Exam.find({ status: 'published' });
      const submittedExamIds = submissions.map(sub => sub.exam._id.toString());
      stats.examsPending = publishedExams.filter(exam => 
        !submittedExamIds.includes(exam._id.toString())
      ).length;

      stats.recentResults = gradedSubmissions
        .sort((a, b) => b.gradedAt - a.gradedAt)
        .slice(0, 5)
        .map(sub => ({
          examTitle: sub.exam.title,
          score: sub.totalScore,
          gradedAt: sub.gradedAt
        }));

      res.status(200).json(stats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  },



publishExam: async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findOne({ _id: id, creator: req.user.userId });
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    if (exam.questions.length === 0) {
      return res.status(400).json({ message: 'Cannot publish exam without questions' });
    }

    exam.status = 'published';
    await exam.save();

    console.log('Published exam:', exam); // Debug log
    res.status(200).json({ 
      message: 'Exam published successfully', 
      exam 
    });
  } catch (error) {
    console.error('Error publishing exam:', error);
    res.status(500).json({ message: 'Server Error' });
  }
}
};

module.exports = ExamController;