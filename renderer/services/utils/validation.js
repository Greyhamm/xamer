export default class ValidationService {
    static validateEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    }
  
    static validatePassword(password) {
      return password.length >= 6;
    }
  
    static validateExam(exam) {
      const errors = [];
  
      if (!exam.title?.trim()) {
        errors.push('Exam title is required');
      }
  
      if (!exam.questions?.length) {
        errors.push('Exam must have at least one question');
      }
  
      exam.questions?.forEach((question, index) => {
        const questionErrors = this.validateQuestion(question);
        if (questionErrors.length) {
          errors.push(`Question ${index + 1}: ${questionErrors.join(', ')}`);
        }
      });
  
      return errors;
    }
  
    static validateQuestion(question) {
      const errors = [];
  
      if (!question.prompt?.trim()) {
        errors.push('Question prompt is required');
      }
  
      switch (question.type) {
        case 'MultipleChoice':
          if (!Array.isArray(question.options) || question.options.length < 2) {
            errors.push('Multiple choice questions must have at least 2 options');
          }
          if (question.correctOption === undefined) {
            errors.push('Correct option must be specified');
          }
          break;
  
        case 'Coding':
          if (!question.language) {
            errors.push('Programming language must be specified');
          }
          break;
  
        case 'Written':
          if (question.maxWords && question.maxWords < 1) {
            errors.push('Maximum word count must be positive');
          }
          break;
      }
  
      return errors;
    }
  }