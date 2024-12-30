import AuthAPI from '../api/authApi';

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
    if (AuthAPI.isAuthenticated()) {
      try {
        const profile = await AuthAPI.getProfile();
        this.setUser(profile);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        AuthAPI.logout();
      }
    }
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

  async login(credentials) {
    const response = await AuthAPI.login(credentials);
    await this.initialize();
    return response;
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