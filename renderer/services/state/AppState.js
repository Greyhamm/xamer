import UserState from './UserState.js';
import ExamState from './ExamState.js';

class AppState {
  constructor() {
    if (AppState.instance) {
      return AppState.instance;
    }
    AppState.instance = this;
    
    this.currentView = null;
    this.listeners = new Set();
    this.userState = UserState;
    this.examState = ExamState;
  }

  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentView));
  }

  async initialize() {
    await this.userState.initialize();
    this.navigateToDefaultView();
  }

  navigateToDefaultView() {
    if (!this.userState.getUser()) {
      this.navigateTo('auth');
      return;
    }

    if (this.userState.isTeacher()) {
      this.navigateTo('teacherDashboard');
    } else {
      this.navigateTo('studentDashboard');
    }
  }

  navigateTo(view, params = {}) {
    console.log('Navigating to:', view, 'with params:', params);
    this.currentView = { name: view, params };
    this.notifyListeners();
}
}

export default new AppState();