import ExamAPI from '../../services/api/examAPI.js';
import SubmissionAPI from '../../services/api/submissionAPI.js';
import { formatDate } from '../../services/utils/formatting.js';
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
  }

  async loadDashboardData() {
    try {
      const [stats, submissions, exams] = await Promise.all([
        ExamAPI.getTeacherStats(),
        SubmissionAPI.getSubmissions(),
        ExamAPI.getExams()
      ]);

      this.setState({
        stats,
        recentSubmissions: submissions.slice(0, 5),
        recentExams: exams.slice(0, 5),
        loading: false
      });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.updateUI();
  }

  renderStatsCards() {
    const container = document.createElement('div');
    container.className = 'stats-cards';

    const stats = [
      { label: 'Total Exams', value: this.state.stats.totalExams },
      { label: 'Published Exams', value: this.state.stats.publishedExams },
      { label: 'Pending Grades', value: this.state.stats.pendingGrading },
      { label: 'Total Submissions', value: this.state.stats.totalSubmissions }
    ];

    stats.forEach(stat => {
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `
        <h3>${stat.label}</h3>
        <p class="stat-value">${stat.value}</p>
      `;
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
      <button class="btn btn-primary">Create New Exam</button>
    `;

    const createExamButton = header.querySelector('button');
    createExamButton.addEventListener('click', () => {
      AppState.navigateTo('examCreator');
    });

    const examsList = document.createElement('div');
    examsList.className = 'exams-list';

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
      <button class="btn btn-secondary">View All</button>
    `;

    const viewAllButton = header.querySelector('button');
    viewAllButton.addEventListener('click', () => {
      AppState.navigateTo('submissionsList');
    });

    const submissionsList = document.createElement('div');
    submissionsList.className = 'submissions-list';

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

    container.appendChild(header);
    container.appendChild(submissionsList);
    return container;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'teacher-dashboard';

    if (this.state.loading) {
      container.innerHTML = '<div class="loading">Loading dashboard data...</div>';
      this.loadDashboardData();
      return container;
    }

    if (this.state.error) {
      container.innerHTML = `<div class="error">${this.state.error}</div>`;
      return container;
    }

    const header = document.createElement('div');
    header.className = 'dashboard-header';
    header.innerHTML = `<h2>Teacher Dashboard</h2>`;

    container.appendChild(header);
    container.appendChild(this.renderStatsCards());
    container.appendChild(this.renderRecentExams());
    container.appendChild(this.renderRecentSubmissions());

    return container;
  }
}