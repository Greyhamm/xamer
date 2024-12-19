// renderer/models/CodingQuestion.js
import { Question } from './Question.js';

export class CodingQuestion extends Question {
  constructor(data = {}) {
    super(data);
    this.type = 'Coding';
    this.language = data.language || 'javascript';
    this.initialCode = data.initialCode || '// Write your code here';
    this.userCode = data.userCode || ''; // Captures participant's code
  }
}
