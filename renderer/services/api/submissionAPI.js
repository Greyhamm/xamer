class SubmissionAPI {
    static async getSubmissions() {
      try {
        return await window.api.getSubmissions();
      } catch (error) {
        console.error('Get submissions error:', error);
        throw new Error(error.message || 'Failed to fetch submissions');
      }
    }
  
    static async gradeSubmission(submissionId, grades) {
      try {
        return await window.api.gradeSubmission(submissionId, grades);
      } catch (error) {
        console.error('Grade submission error:', error);
        throw new Error(error.message || 'Failed to grade submission');
      }
    }
  }
  
  export default SubmissionAPI;