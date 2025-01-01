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
    
      switch (question.type) {
        case 'MultipleChoice':
          if (!question.options || question.options.length < 2) {
            errors.push('Multiple choice question must have at least 2 options');
          }
          if (question.correctOption === undefined || 
              question.correctOption < 0 || 
              question.correctOption >= question.options.length) {
            errors.push('Invalid correct option');
          }
          break;
        case 'Coding':
          if (!question.language) {
            errors.push('Coding question must specify a language');
          }
          break;
        case 'Written':
          // Add any specific written question validations if needed
          break;
      }
    
      return errors;
    }
  }
  module.exports = ValidationService;