import AuthAPI from '../api/authApi.js';

class UserState {
  constructor() {
    if (UserState.instance) {
      return UserState.instance;
    }
    UserState.instance = this;
    
    this.user = null;
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

  async initialize() {
    // Always clear user state
    this.user = null;
    localStorage.clear();
    sessionStorage.clear();
    return false;
  }

  setUser(user) {
    this.user = user;
    this.notifyListeners();
  }

  getUser() {
    return this.user;
  }

  isTeacher() {
    return this.user?.role === 'teacher';
  }

  isStudent() {
    return this.user?.role === 'student';
  }

  async login(userData) {
    return await AuthAPI.login(userData);
  }

  async signup(userData) {
    const response = await AuthAPI.signup(userData);
    await this.initialize();
    return response;
  }

  logout() {
    this.setUser(null);
    AuthAPI.logout();
  }
}

export default new UserState();