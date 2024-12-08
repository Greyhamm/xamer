// models/CodingQuestion.js
import { Question } from './Question.js';

export class CodingQuestion extends Question {
  constructor(data = {}) {
    super(data);
    this.type = 'Coding';
    this.language = data.language || 'javascript';
    this.code = data.code || '// Write your code here';
  }
}
