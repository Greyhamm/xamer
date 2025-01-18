// App.js
import AppState from './services/state/AppState.js';
import UserState from './services/state/UserState.js';
import AuthManager from './components/auth/AuthManager.js';
import TeacherDashboard from './components/dashboard/TeacherDashboard.js';
import StudentDashboard from './components/dashboard/StudentDashboard.js';
import ExamCreator from './components/exam/creation/ExamCreator.js';
import ExamTaker from './components/exam/taking/ExamTaker.js';
import GradingView from './components/exam/grading/GradingView.js';
import SubmissionsList from './components/exam/grading/SubmissionsList.js';
import TopHeader from './components/common/TopHeader.js';
import ClassView from './components/class/ClassView.js';
export default class App {
  constructor() {
    this.currentView = null;
    this.container = document.getElementById('main-content');
    this.header = null;
    
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
    
    // Render new view
    this.renderView(newView);
  }

async renderView(view) {
    if (!view) return;

    try {
        if (UserState.getUser()) {
            this.header = new TopHeader();
            this.container.appendChild(this.header.render());
            
            const mainWrapper = document.createElement('div');
            mainWrapper.style.paddingTop = '64px';
            this.container.appendChild(mainWrapper);

        
        let component;
        console.log('Rendering view:', view.name, 'with params:', view.params);
        switch (view.name) {
          case 'auth':
            component = new AuthManager();
            break;
          case 'examCreator':
            component = new ExamCreator({
              classId: view.params.classId
            });
            break;
          case 'teacherDashboard':
            component = new TeacherDashboard();
            break;
          case 'studentDashboard':
            component = new StudentDashboard();
            break;
          case 'examTaker':
            component = new ExamTaker();
            if (view.params.examId) {
              await component.loadExam(view.params.examId);
            }
            break;
          case 'gradingView':
            if (!view.params?.submissionId) {
              console.error('No submission ID provided to GradingView');
              // Maybe show an error message or redirect
              return;
            }
            component = new GradingView({
              submissionId: view.params.submissionId
            });
            break;
          case 'submissionsList':
            component = new SubmissionsList(view.params);
            break;
          case 'classView':
            component = new ClassView(view.params.classId);
            break;
          default:
            this.showError('Invalid view requested');
            return;
        }

   
        if (component) {
          mainWrapper.appendChild(component.render());
      }
    } else {
        const authManager = new AuthManager();
        this.container.appendChild(authManager.render());
    }
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