// models/MultipleChoiceQuestion.js
import { Question } from './Question.js';

export class MultipleChoiceQuestion extends Question {
  constructor(data = {}) {
    super(data);
    this.type = 'MultipleChoice';
    this.options = data.options || ['', '', '', ''];
    this.correctOption = data.correctOption || 0;
  }
}
