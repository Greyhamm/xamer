// models/WrittenQuestion.js
import { Question } from './Question.js';

export class WrittenQuestion extends Question {
  constructor(data = {}) {
    super(data);
    this.type = 'Written';
    // Additional properties can be added as needed
  }
}
