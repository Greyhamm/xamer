import ExamAPI from '../api/examAPI.js';

class ExamState {
  constructor() {
    if (ExamState.instance) {
      return ExamState.instance;
    }
    ExamState.instance = this;
    
    this.currentExam = null;
    this.listeners = new Set();
  }

  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.user));
  }

  setCurrentExam(exam) {
    this.currentExam = exam;
    this.notifyListeners();
  }

  async saveExam(examData) {
    try {
      const response = await ExamAPI.createExam(examData);
      this.setCurrentExam(response);
      return response;
    } catch (error) {
      console.error('Save exam error:', error);
      throw error;
    }
  }

  async publishExam(examId) {
    try {
      const response = await ExamAPI.publishExam(examId);
      this.setCurrentExam(response);
      return response;
    } catch (error) {
      console.error('Publish exam error:', error);
      throw error;
    }
  }

  // Added Methods

  async getStats() {
    try {
      const stats = await ExamAPI.getStats();
      return stats;
    } catch (error) {
      console.error('Failed to get stats:', error);
      throw error;
    }
  }

  async getRecentExams() {
    try {
      const recentExams = await ExamAPI.getRecentExams();
      return recentExams;
    } catch (error) {
      console.error('Failed to get recent exams:', error);
      throw error;
    }
  }

  async getRecentSubmissions() {
    try {
      const recentSubmissions = await ExamAPI.getRecentSubmissions();
      return recentSubmissions;
    } catch (error) {
      console.error('Failed to get recent submissions:', error);
      throw error;
    }
  }
}

export default new ExamState();