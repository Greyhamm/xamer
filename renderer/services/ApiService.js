// renderer/services/ApiService.js
export default class ApiService {
  /**
   * Fetches all available exams.
   * @returns {Promise<Array>} Array of exams.
   */
  static async getExams() {
    try {
      const exams = await window.api.getExams();
      return exams;
    } catch (err) {
      console.error('Error fetching exams:', err);
      throw new Error('Failed to fetch exams.');
    }
  }

  /**
   * Fetches a specific exam by its ID.
   * @param {string} examId - The ID of the exam.
   * @returns {Promise<Object>} Exam data.
   */
  static async getExamById(examId) {
    try {
      const examData = await window.api.getExamById(examId);
      return examData;
    } catch (err) {
      console.error(`Error fetching exam with ID ${examId}:`, err);
      throw new Error('Failed to fetch exam.');
    }
  }

  /**
   * Creates a new exam.
   * @param {Exam} exam - The exam instance to create.
   * @returns {Promise<Object>} Response data.
   */
  static async createExam(exam) {
    try {
      const data = await window.api.createExam(exam);
      return data;
    } catch (err) {
      console.error('Error creating exam:', err);
      throw new Error('Failed to create exam.');
    }
  }

  /**
   * Executes JavaScript code securely via the backend.
   * @param {string} code - The JavaScript code to execute.
   * @returns {Promise<Object>} Execution response.
   */
  static async executeJavaScript(code) {
    try {
      const response = await window.api.executeJavaScript(code);
      return response;
    } catch (err) {
      console.error('Error executing JavaScript:', err);
      throw new Error('Failed to execute JavaScript code.');
    }
  }

  /**
   * Executes Python code securely via the backend.
   * @param {string} code - The Python code to execute.
   * @returns {Promise<Object>} Execution response.
   */
  static async executePython(code) {
    try {
      const response = await window.api.executePython(code);
      return response;
    } catch (err) {
      console.error('Error executing Python:', err);
      throw new Error('Failed to execute Python code.');
    }
  }

  /**
   * Executes Java code securely via the backend.
   * @param {string} userCode - The user's Java code.
   * @param {string} initialCode - The initial Java code (if any).
   * @returns {Promise<Object>} Execution response.
   */
  static async executeJava(userCode, initialCode) {
    try {
      const response = await window.api.executeJava(userCode, initialCode);
      return response;
    } catch (err) {
      console.error('Error executing Java:', err);
      throw new Error('Failed to execute Java code.');
    }
  }

  /**
   * Uploads a media file (image or video) to the server.
   * @param {File} file - The media file to upload.
   * @returns {Promise<Object>} Response containing the media URL.
   */
  static async uploadMedia(file) {
    try {
      const response = await window.api.uploadMedia(file);
      return response; // Expecting { url: 'https://...' }
    } catch (err) {
      console.error('Error uploading media:', err);
      throw new Error('Failed to upload media.');
    }
  }
}
