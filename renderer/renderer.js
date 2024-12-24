// renderer/renderer.js
import ExamCreator from './components/ExamCreator.js';
import ExamTaker from './components/ExamTaker.js';
import LoginForm from './components/Auth/LoginForm.js';
import SignupForm from './components/Auth/SignupForm.js';
import TeacherDashboard from './components/Dashboard/TeacherDashboard.js';
import StudentDashboard from './components/Dashboard/StudentDashboard.js';
import AuthManager from './components/Auth/AuthManager.js';
import SubmissionsView from './components/Submissions/SubmissionsView.js';
class App {
  constructor() {
    this.currentUser = null;
    this.authManager = new AuthManager();
    this.init();
  }

  async init() {
    const { token, role } = this.checkAuth();
    
    if (!token) {
      this.renderAuth();
      return;
    }

    try {
      // Fetch user profile
      const profile = await window.api.getProfile();
      this.currentUser = { ...profile, role };
      this.updateHeader();
      this.renderDashboard();
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      this.handleLogout();
    }
  }

  checkAuth() {
    return {
      token: localStorage.getItem('token'),
      role: localStorage.getItem('role')
    };
  }

  updateHeader() {
    const header = document.querySelector('header');
    
    // Clear existing content
    while (header.firstChild) {
      header.removeChild(header.firstChild);
    }

    // Create new header content
    const title = document.createElement('h1');
    title.textContent = 'Electron Exam Application';

    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.innerHTML = `
      <span>${this.currentUser.username}</span>
      <span class="user-role">${this.currentUser.role}</span>
      <button id="logout-btn" class="btn">Logout</button>
    `;

    const nav = document.createElement('nav');
    
    if (this.currentUser.role === 'teacher') {
      nav.innerHTML = `
        <button id="dashboard-btn" class="btn">Dashboard</button>
        <button id="create-exam-btn" class="btn">Create Exam</button>
        <button id="view-submissions-btn" class="btn">View Submissions</button>
      `;
    } else {
      nav.innerHTML = `
        <button id="dashboard-btn" class="btn">Dashboard</button>
        <button id="take-exam-btn" class="btn">Take Exam</button>
        <button id="view-results-btn" class="btn">View Results</button>
      `;
    }

    header.appendChild(title);
    header.appendChild(nav);
    header.appendChild(userInfo);

    this.attachHeaderEventListeners();
  }

  attachHeaderEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    const dashboardBtn = document.getElementById('dashboard-btn');
    if (dashboardBtn) {
      dashboardBtn.addEventListener('click', () => this.renderDashboard());
    }

    if (this.currentUser.role === 'teacher') {
      const createExamBtn = document.getElementById('create-exam-btn');
      const viewSubmissionsBtn = document.getElementById('view-submissions-btn');

      if (createExamBtn) {
        createExamBtn.addEventListener('click', () => this.loadExamCreator());
      }
      if (viewSubmissionsBtn) {
        viewSubmissionsBtn.addEventListener('click', () => this.loadSubmissions());
      }
    } else {
      const takeExamBtn = document.getElementById('take-exam-btn');
      const viewResultsBtn = document.getElementById('view-results-btn');

      if (takeExamBtn) {
        takeExamBtn.addEventListener('click', () => this.loadExamTaker());
      }
      if (viewResultsBtn) {
        viewResultsBtn.addEventListener('click', () => this.loadResults());
      }
    }
  }

  handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.currentUser = null;
    window.location.reload();
  }

  renderAuth() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';
    mainContent.appendChild(this.authManager.render());
  }

  renderDashboard() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';

    const DashboardComponent = this.currentUser.role === 'teacher' ? TeacherDashboard : StudentDashboard;
    const dashboard = new DashboardComponent(this.currentUser);
    mainContent.appendChild(dashboard.render());
  }

  async loadExamCreator() {
    try {
      const examCreator = new ExamCreator();
      const content = examCreator.render();
      document.getElementById('main-content').innerHTML = '';
      document.getElementById('main-content').appendChild(content);
    } catch (error) {
      console.error('Failed to load ExamCreator:', error);
      alert('Failed to load exam creator.');
    }
  }

  async loadExamTaker() {
    try {
      const examTaker = new ExamTaker();
      const content = await examTaker.render();
      document.getElementById('main-content').innerHTML = '';
      document.getElementById('main-content').appendChild(content);
    } catch (error) {
      console.error('Failed to load ExamTaker:', error);
      alert('Failed to load exam taker.');
    }
  }

  async loadSubmissions() {
    try {
      const mainContent = document.getElementById('main-content');
      mainContent.innerHTML = '<div class="loading">Loading submissions...</div>';
      
      const submissions = await window.api.getSubmissions();
      // Render submissions view (will be implemented in another component)
      const submissionsView = new SubmissionsView(submissions);
      mainContent.innerHTML = '';
      mainContent.appendChild(submissionsView.render());
    } catch (error) {
      console.error('Failed to load submissions:', error);
      alert('Failed to load submissions.');
    }
  }

  async loadResults() {
    try {
      const mainContent = document.getElementById('main-content');
      mainContent.innerHTML = '<div class="loading">Loading results...</div>';
      
      const submissions = await window.api.getSubmissions();
      // Render results view (will be implemented in another component)
      const resultsView = new ResultsView(submissions);
      mainContent.innerHTML = '';
      mainContent.appendChild(resultsView.render());
    } catch (error) {
      console.error('Failed to load results:', error);
      alert('Failed to load results.');
    }
  }
  async loadSubmissions() {
    try {
      const mainContent = document.getElementById('main-content');
      mainContent.innerHTML = '<div class="loading">Loading submissions...</div>';
      
      const submissionsView = new SubmissionsView();
      mainContent.innerHTML = '';
      mainContent.appendChild(submissionsView.render());
    } catch (error) {
      console.error('Failed to load submissions:', error);
      alert('Failed to load submissions.');
    }
  }
  
  // Update the student dashboard exam taking handler
  async loadExamTaker() {
    try {
      const examTaker = new ExamTaker();
      const content = await examTaker.render();
      document.getElementById('main-content').innerHTML = '';
      document.getElementById('main-content').appendChild(content);
    } catch (error) {
      console.error('Failed to load ExamTaker:', error);
      alert('Failed to load exam taker.');
    }
  }
}


// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new App();
});