class SubmissionAPI {
  static async getSubmissions() {
      try {
          const response = await window.api.getSubmissions();
          if (!response.success) {
              throw new Error(response.error || 'Failed to fetch submissions');
          }
          return response;
      } catch (error) {
          console.error('Get submissions error:', error);
          throw error;
      }
  }

  static async getSubmissionById(submissionId) {
      try {
          const response = await window.api.getSubmissionById(submissionId);
          if (!response.success) {
              throw new Error(response.error || 'Failed to fetch submission');
          }
          return response.data;
      } catch (error) {
          console.error('Get submission by ID error:', error);
          throw error;
      }
  }

  static async gradeSubmission(submissionId, grades) {
      try {
          const response = await window.api.gradeSubmission(submissionId, grades);
          if (!response.success) {
              throw new Error(response.error || 'Failed to grade submission');
          }
          return response.data;
      } catch (error) {
          console.error('Grade submission error:', error);
          throw error;
      }
  }
}

export default SubmissionAPI;