import UserState from './UserState.js';
import ExamState from './ExamState.js';

class AppState {
  constructor() {
    if (AppState.instance) {
      return AppState.instance;
    }
    AppState.instance = this;
    
    this.currentView = null;
    this.navigationHistory = [];
    this.listeners = new Set();
    this.userState = UserState;
    this.examState = ExamState;

    // Add popstate event listener for browser back button
    window.addEventListener('popstate', (event) => {
      if (event.state) {
        this.navigateBack(true);
      }
    });
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
      this.navigateTo('auth', {}, { addToHistory: false });
      return;
    }

    if (this.userState.isTeacher()) {
      this.navigateTo('teacherDashboard', {}, { addToHistory: false });
    } else {
      this.navigateTo('studentDashboard', {}, { addToHistory: false });
    }
  }

  navigateTo(view, params = {}, options = {}) {
    console.log('Navigating to:', view, 'with params:', params);
    
    // Add current view to history before changing, unless specified not to
    if (this.currentView && options.addToHistory !== false) {
      // Don't add auth view to history
      if (this.currentView.name !== 'auth') {
        this.navigationHistory.push(this.currentView);
      }
    }
    
    this.currentView = { name: view, params };
    
    // Push state to browser history
    window.history.pushState(
      { view, params },
      '',
      `#/${view}${params ? `/${JSON.stringify(params)}` : ''}`
    );
    
    this.notifyListeners();
  }

  navigateBack(fromBrowser = false) {
    if (this.navigationHistory.length > 0) {
      const previousView = this.navigationHistory.pop();
      
      // Don't navigate back to auth
      if (previousView.name === 'auth') {
        return this.navigateBack(fromBrowser);
      }

      this.currentView = previousView;
      
      if (!fromBrowser) {
        window.history.pushState(
          { view: previousView.name, params: previousView.params },
          '',
          `#/${previousView.name}${previousView.params ? `/${JSON.stringify(previousView.params)}` : ''}`
        );
      }
      
      this.notifyListeners();
      return true;
    }
    return false;
  }

  canNavigateBack() {
    // Check if we have any non-auth pages in history
    return this.navigationHistory.some(view => view.name !== 'auth');
  }

  shouldShowBackButton() {
    // Don't show back button on dashboard pages or auth
    const dashboardViews = ['teacherDashboard', 'studentDashboard', 'auth'];
    return !dashboardViews.includes(this.currentView?.name) && this.canNavigateBack();
  }

  getNavigationHistory() {
    return [...this.navigationHistory];
  }

  getCurrentView() {
    return this.currentView;
  }

  clearHistory() {
    this.navigationHistory = [];
  }

  // Method to check if the current view is a dashboard
  isDashboardView() {
    return ['teacherDashboard', 'studentDashboard'].includes(this.currentView?.name);
  }

  // Method to check if the current view is auth
  isAuthView() {
    return this.currentView?.name === 'auth';
  }

  // Method to get the appropriate dashboard view for the current user
  getDashboardView() {
    return this.userState.isTeacher() ? 'teacherDashboard' : 'studentDashboard';
  }

  // Method to navigate to dashboard
  navigateToDashboard() {
    const dashboardView = this.getDashboardView();
    this.navigateTo(dashboardView, {}, { addToHistory: false });
  }

  // Method to handle session expiration or logout
  handleSessionEnd() {
    this.clearHistory();
    this.userState.logout();
    this.navigateToDefaultView();
  }

  // Method to check if navigation to a view is allowed
  canNavigateToView(view) {
    if (!this.userState.getUser()) {
      return view === 'auth';
    }

    const teacherOnlyViews = ['examCreator', 'submissionsList', 'classView', 'gradingView'];
    const studentOnlyViews = ['examTaker'];

    if (this.userState.isTeacher()) {
      return !studentOnlyViews.includes(view);
    } else {
      return !teacherOnlyViews.includes(view);
    }
  }

  // Method to handle navigation errors
  handleNavigationError(error) {
    console.error('Navigation error:', error);
    this.navigateToDashboard();
  }

  // Helper method to build the URL for a view
  buildViewUrl(view, params) {
    let url = `#/${view}`;
    if (params && Object.keys(params).length > 0) {
      url += `/${JSON.stringify(params)}`;
    }
    return url;
  }

  // Method to parse URL and navigate to the corresponding view
  parseUrlAndNavigate() {
    try {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (!hash) {
        this.navigateToDefaultView();
        return;
      }

      const [view, paramsStr] = hash.slice(1).split('/');
      const params = paramsStr ? JSON.parse(paramsStr) : {};

      if (this.canNavigateToView(view)) {
        this.navigateTo(view, params);
      } else {
        this.navigateToDefaultView();
      }
    } catch (error) {
      console.error('URL parsing error:', error);
      this.navigateToDefaultView();
    }
  }
}

export default new AppState();