import AppState from './services/state/AppState.js';
import UserState from './services/state/UserState.js';
import AuthManager from './components/Auth/AuthManager.js';
import TeacherDashboard from './components/dashboard/TeacherDashboard.js';
import StudentDashboard from './components/dashboard/StudentDashboard.js';
import ExamCreator from './components/exam/creation/ExamCreator.js';
import ExamTaker from './components/exam/taking/ExamTaker.js';
import GradingView from './components/exam/grading/GradingView.js';
import SubmissionsList from './components/exam/grading/SubmissionsList.js';

export default class App {
  constructor() {
    this.currentView = null;
    this.container = document.getElementById('main-content');
    
    // Bind app state listener
    AppState.addListener(this.handleStateChange.bind(this));
    
    // Initialize the application
    this.initialize();
  }

  async initialize() {
    try {
      await AppState.initialize();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to initialize application');
    }
  }

  handleStateChange(newView) {
    // Clear any existing content
    this.container.innerHTML = '';
    
    // Update header based on authentication state
    this.updateHeader();
    
    // Render new view
    this.renderView(newView);
  }

  updateHeader() {
    const header = document.querySelector('header');
    const user = UserState.getUser();
    
    if (!user) {
      header.innerHTML = '<h1>Exam Application</h1>';
      return;
    }

    header.innerHTML = `
      <div class="header-content">
        <h1>Exam Application</h1>
        <nav>
          ${this.getNavigationButtons()}
        </nav>
        <div class="user-info">
          <span>${user.username}</span>
          <span class="role-badge">${user.role}</span>
          <button id="logout-btn" class="btn btn-secondary">Logout</button>
        </div>
      </div>
    `;

    // Add logout handler
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      UserState.logout();
    });
  }

  getNavigationButtons() {
    const user = UserState.getUser();
    if (!user) return '';

    if (user.role === 'teacher') {
      return `
        <button class="nav-btn" data-view="teacherDashboard">Dashboard</button>
        <button class="nav-btn" data-view="examCreator">Create Exam</button>
        <button class="nav-btn" data-view="submissionsList">Submissions</button>
      `;
    }

    return `
      <button class="nav-btn" data-view="studentDashboard">Dashboard</button>
      <button class="nav-btn" data-view="examList">Available Exams</button>
      <button class="nav-btn" data-view="submissionsList">My Submissions</button>
    `;
  }

  async renderView(view) {
    if (!view) return;

    try {
      let component;
      switch (view.name) {
        case 'auth':
          component = new AuthManager();
          break;
        case 'teacherDashboard':
          component = new TeacherDashboard();
          break;
        case 'studentDashboard':
          component = new StudentDashboard();
          break;
        case 'examCreator':
          component = new ExamCreator();
          break;
        case 'examTaker':
          component = new ExamTaker();
          if (view.params.examId) {
            await component.loadExam(view.params.examId);
          }
          break;
        case 'gradingView':
          component = new GradingView(view.params.submissionId);
          break;
        case 'submissionsList':
          component = new SubmissionsList();
          break;
        default:
          this.showError('Invalid view requested');
          return;
      }

      this.container.appendChild(component.render());

      // Add navigation event listeners
      document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          AppState.navigateTo(btn.dataset.view);
        });
      });
    } catch (error) {
      console.error('Error rendering view:', error);
      this.showError('Failed to render view');
    }
  }

  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    this.container.appendChild(errorElement);
  }
}