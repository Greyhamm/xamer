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
    this.listeners.forEach(callback => callback(this.currentExam));
  }

  setCurrentExam(exam) {
    this.currentExam = exam;
    this.notifyListeners();
  }

  async saveExam(examData) {
    const response = await ExamAPI.createExam(examData);
    this.setCurrentExam(response.data);
    return response;
  }

  async publishExam(examId) {
    const response = await ExamAPI.publishExam(examId);
    this.setCurrentExam(response.data);
    return response;
  }
}

export default new ExamState();