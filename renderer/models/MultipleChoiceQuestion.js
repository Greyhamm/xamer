// models/MultipleChoiceQuestion.js
import { Question } from './Question.js';

export class MultipleChoiceQuestion {
  constructor(data = {}) {
    this.type = 'MultipleChoice';
    this.prompt = data.prompt || '';
    this.options = data.options || ['', '', '', ''];
    this.correctOption = data.correctOption !== undefined ? data.correctOption : null;
    this.media = data.media || null; // New field for media
  }
}

