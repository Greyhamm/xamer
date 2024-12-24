// renderer/models/CodingQuestion.js
import { Question } from './Question.js';
export class CodingQuestion {
  constructor(data = {}) {
    this.type = 'Coding';
    this.prompt = data.prompt || '';
    this.language = data.language || 'javascript';
    this.initialCode = data.initialCode || '';
    this.media = data.media || null; // New field for media
  }

}
