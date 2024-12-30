import ExamState from '../../services/state/ExamState.js';
import SubmissionAPI from '../../services/api/submissionAPI.js';
import { formatDate } from '../../services/utils/formating.js';
import AppState from '../../services/state/AppState.js';

export default class TeacherDashboard {
  constructor() {
    this.state = {
      stats: null,
      recentExams: [],
      recentSubmissions: [],
      loading: true,
      error: null
    };
    this.loadDashboardData = this.loadDashboardData.bind(this);
    this.updateUI = this.updateUI.bind(this);
    this.render = this.render.bind(this);

    // Add listener to ExamState
    ExamState.addListener(this.onExamStateChange.bind(this));

    this.loadDashboardData();
  }

  onExamStateChange(state) {
    // Update state based on ExamState changes
    if (state.stats) {
      this.state.stats = state.stats;
    }
    if (state.recentExams) {
      this.state.recentExams = state.recentExams;
    }
    if (state.recentSubmissions) {
      this.state.recentSubmissions = state.recentSubmissions;
    }
    this.updateUI();
  }

  async loadDashboardData() {
    console.log('Loading dashboard data...');
    try {
      this.state.loading = true;
      this.updateUI();

      await Promise.all([
        ExamState.getStats(),
        ExamState.getRecentExams(),
        ExamState.getRecentSubmissions()
      ]);

      this.state.loading = false;
      this.updateUI();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      this.state.error = error.message;
      this.state.loading = false;
      this.updateUI();
    }
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.updateUI();
  }

  updateUI() {
    // Re-render the dashboard with the updated state
    const dashboardContainer = document.querySelector('.teacher-dashboard');
    if (dashboardContainer) {
      dashboardContainer.innerHTML = '';
      dashboardContainer.appendChild(this.render());
    }
  }

  renderStatsCards() {
    const container = document.createElement('div');
    container.className = 'stats-cards';

    if (!this.state.stats) {
      const noStats = document.createElement('p');
      noStats.textContent = 'No statistics available.';
      container.appendChild(noStats);
      return container;
    }

    const stats = [
      { label: 'Total Exams', value: this.state.stats.totalExams },
      { label: 'Published Exams', value: this.state.stats.publishedExams },
      { label: 'Pending Grades', value: this.state.stats.pendingGrading },
      { label: 'Total Submissions', value: this.state.stats.totalSubmissions }
    ];

    stats.forEach(stat => {
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `<h4>${stat.label}</h4><p>${stat.value}</p>`;
      container.appendChild(card);
    });

    return container;
  }

  renderRecentExams() {
    const container = document.createElement('div');
    container.className = 'recent-exams section';

    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `
      <h3>Recent Exams</h3>
      <button class="btn btn-primary" id="create-exam-btn">Create New Exam</button>
    `;

    const createExamButton = header.querySelector('#create-exam-btn');
    createExamButton.addEventListener('click', () => {
      AppState.navigateTo('examCreator');
    });

    const examsList = document.createElement('div');
    examsList.className = 'exams-list';

    if (!Array.isArray(this.state.recentExams)) {
      console.error('recentExams is not an array:', this.state.recentExams);
      const errorMsg = document.createElement('p');
      errorMsg.textContent = 'Error loading recent exams.';
      examsList.appendChild(errorMsg);
    } else if (this.state.recentExams.length === 0) {
      const noExams = document.createElement('p');
      noExams.textContent = 'No recent exams found.';
      examsList.appendChild(noExams);
    } else {
      this.state.recentExams.forEach(exam => {
        const examCard = document.createElement('div');
        examCard.className = 'exam-card';
        examCard.innerHTML = `
          <h4>${exam.title}</h4>
          <p>Status: <span class="status-badge ${exam.status}">${exam.status}</span></p>
          <p>Questions: ${exam.questions.length}</p>
          <p>Created: ${formatDate(exam.createdAt)}</p>
          <div class="card-actions">
            <button class="btn btn-secondary">View Details</button>
            ${exam.status === 'draft' ? '<button class="btn btn-primary">Publish</button>' : ''}
          </div>
        `;

        const viewButton = examCard.querySelector('.btn-secondary');
        viewButton.addEventListener('click', () => {
          AppState.navigateTo('examDetails', { examId: exam._id });
        });

        const publishButton = examCard.querySelector('.btn-primary');
        if (publishButton) {
          publishButton.addEventListener('click', async () => {
            try {
              await ExamAPI.publishExam(exam._id);
              this.loadDashboardData();
            } catch (error) {
              alert('Failed to publish exam: ' + error.message);
            }
          });
        }

        examsList.appendChild(examCard);
      });
    }

    container.appendChild(header);
    container.appendChild(examsList);
    return container;
  }

  renderRecentSubmissions() {
    const container = document.createElement('div');
    container.className = 'recent-submissions section';

    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `
      <h3>Recent Submissions</h3>
      <button class="btn btn-secondary" id="view-all-submissions-btn">View All</button>
    `;

    const viewAllButton = header.querySelector('#view-all-submissions-btn');
    viewAllButton.addEventListener('click', () => {
      AppState.navigateTo('submissionsList');
    });

    const submissionsList = document.createElement('div');
    submissionsList.className = 'submissions-list';

    if (!Array.isArray(this.state.recentSubmissions)) {
      console.error('recentSubmissions is not an array:', this.state.recentSubmissions);
      const errorMsg = document.createElement('p');
      errorMsg.textContent = 'Error loading recent submissions.';
      submissionsList.appendChild(errorMsg);
    } else if (this.state.recentSubmissions.length === 0) {
      const noSubmissions = document.createElement('p');
      noSubmissions.textContent = 'No recent submissions found.';
      submissionsList.appendChild(noSubmissions);
    } else {
      this.state.recentSubmissions.forEach(submission => {
        const submissionCard = document.createElement('div');
        submissionCard.className = 'submission-card';
        submissionCard.innerHTML = `
          <div class="submission-info">
            <h4>${submission.exam.title}</h4>
            <p>Student: ${submission.student.username}</p>
            <p>Submitted: ${formatDate(submission.submittedAt)}</p>
            <p>Status: <span class="status-badge ${submission.status}">${submission.status}</span></p>
          </div>
          <button class="btn btn-${submission.status === 'graded' ? 'secondary' : 'primary'}">
            ${submission.status === 'graded' ? 'Review' : 'Grade'}
          </button>
        `;

        const actionButton = submissionCard.querySelector('button');
        actionButton.addEventListener('click', () => {
          AppState.navigateTo('gradingView', { submissionId: submission._id });
        });

        submissionsList.appendChild(submissionCard);
      });
    }

    container.appendChild(header);
    container.appendChild(submissionsList);
    return container;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'teacher-dashboard';

    if (this.state.loading) {
      const loading = document.createElement('p');
      loading.textContent = 'Loading dashboard data...';
      container.appendChild(loading);
      return container;
    }

    if (this.state.error) {
      const error = document.createElement('p');
      error.className = 'error-message';
      error.textContent = `Error: ${this.state.error}`;
      container.appendChild(error);
      return container;
    }

    container.appendChild(this.renderStatsCards());
    container.appendChild(this.renderRecentExams());
    container.appendChild(this.renderRecentSubmissions());

    return container;
  }
}