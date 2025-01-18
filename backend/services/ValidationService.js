class ValidationService {
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

      if (typeof question.points !== 'number' || question.points < 0) {
        errors.push('Points must be a non-negative number');
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
  module.exports = ValidationService;