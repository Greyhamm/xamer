// models/Question.js
export class Question {
    constructor(data = {}) {
      this.prompt = data.prompt || '';
      this.type = data.type || 'Generic';
    }
  }
  