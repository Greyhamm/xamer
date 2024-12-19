// renderer/models/Exam.js
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion.js';
import { WrittenQuestion } from './WrittenQuestion.js';
import { CodingQuestion } from './CodingQuestion.js';

export class Exam {
  constructor(data = {}) {
    this.title = data.title || '';
    this.questions = data.questions
      ? data.questions.map((q) => Exam.deserializeQuestion(q))
      : [];
  }

  addQuestion(question) {
    this.questions.push(question);
  }

  static deserializeQuestion(data) {
    switch (data.type) {
      case 'MultipleChoice':
        return new MultipleChoiceQuestion(data);
      case 'Written':
        return new WrittenQuestion(data);
      case 'Coding':
        return new CodingQuestion(data);
      default:
        throw new Error(`Unknown question type: ${data.type}`);
    }
  }
  removeQuestion(question) {
    this.questions = this.questions.filter(q => q !== question);
  }
}

