class ExamAPI {
    static async createExam(examData) {
      try {
        return await window.api.createExam(examData);
      } catch (error) {
        console.error('Create exam error:', error);
        throw new Error(error.message || 'Failed to create exam');
      }
    }
  
    static async publishExam(examId) {
      try {
        return await window.api.publishExam(examId);
      } catch (error) {
        console.error('Publish exam error:', error);
        throw new Error(error.message || 'Failed to publish exam');
      }
    }
  
    static async getExams() {
      try {
        return await window.api.getExams();
      } catch (error) {
        console.error('Get exams error:', error);
        throw new Error(error.message || 'Failed to fetch exams');
      }
    }
  
    static async getExamById(examId) {
      try {
        return await window.api.getExamById(examId);
      } catch (error) {
        console.error('Get exam error:', error);
        throw new Error(error.message || 'Failed to fetch exam');
      }
    }
  }
  
  export default ExamAPI;