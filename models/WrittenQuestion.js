// models/WrittenQuestion.js
import { Question } from './Question.js';

export class WrittenQuestion {
  constructor(data = {}) {
    this.type = 'Written';
    this.prompt = data.prompt || '';
    this.media = data.media || null; // New field for media
  }

}
