import ExamAPI from '../../services/api/examAPI.js';
import SubmissionAPI from '../../services/api/submissionAPI.js';
import { formatDate } from '../../services/utils/formating.js';
import AppState from '../../services/state/AppState.js';

export default class StudentDashboard {
  constructor() {
    this.state = {
      stats: null,
      availableExams: [],
      recentSubmissions: [],
      loading: true,
      error: null
    };
  }

  async loadDashboardData() {
    try {
      const [stats, submissions, exams] = await Promise.all([
        ExamAPI.getStudentStats(),
        SubmissionAPI.getSubmissions(),
        ExamAPI.getExams()
      ]);

      // Filter out exams that have already been submitted
      const submittedExamIds = submissions.map(sub => sub.exam._id);
      const availableExams = exams.filter(exam => 
        exam.status === 'published' && !submittedExamIds.includes(exam._id)
      );

      this.setState({
        stats,
        availableExams,
        recentSubmissions: submissions.slice(0, 5),
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
      { label: 'Exams Taken', value: this.state.stats.totalExamsTaken },
      { label: 'Average Score', value: `${Math.round(this.state.stats.averageScore)}%` },
      { label: 'Exams Available', value: this.state.availableExams.length },
      { label: 'Pending Results', value: this.state.stats.pendingResults }
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

  renderAvailableExams() {
    const container = document.createElement('div');
    container.className = 'available-exams section';

    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = '<h3>Available Exams</h3>';

    const examsList = document.createElement('div');
    examsList.className = 'exams-list';

    if (this.state.availableExams.length === 0) {
      examsList.innerHTML = '<p class="no-data">No exams available at the moment.</p>';
    } else {
      this.state.availableExams.forEach(exam => {
        const examCard = document.createElement('div');
        examCard.className = 'exam-card';
        examCard.innerHTML = `
          <h4>${exam.title}</h4>
          <p>Questions: ${exam.questions.length}</p>
          <p>Created by: ${exam.creator.username}</p>
          <button class="btn btn-primary">Start Exam</button>
        `;

        const startButton = examCard.querySelector('button');
        startButton.addEventListener('click', () => {
          AppState.navigateTo('examTaker', { examId: exam._id });
        });

        examsList.appendChild(examCard);
      });
    }

    container.appendChild(header);
    container.appendChild(examsList);
    return container;
  }

  renderRecentResults() {
    const container = document.createElement('div');
    container.className = 'recent-results section';

    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = '<h3>Recent Results</h3>';

    const resultsList = document.createElement('div');
    resultsList.className = 'results-list';

    this.state.recentSubmissions.forEach(submission => {
      const resultCard = document.createElement('div');
      resultCard.className = 'result-card';
      resultCard.innerHTML = `
        <h4>${submission.exam.title}</h4>
        <p>Submitted: ${formatDate(submission.submittedAt)}</p>
        <p>Status: <span class="status-badge ${submission.status}">
          ${submission.status}
        </span></p>
        ${submission.status === 'graded' ? 
          `<p class="score">Score: ${submission.totalScore}%</p>` : 
          '<p class="pending">Awaiting grading</p>'}
        <button class="btn btn-secondary">View Details</button>
      `;

      const viewButton = resultCard.querySelector('button');
      viewButton.addEventListener('click', () => {
        AppState.navigateTo('submissionDetails', { submissionId: submission._id });
      });

      resultsList.appendChild(resultCard);
    });

    container.appendChild(header);
    container.appendChild(resultsList);
    return container;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'student-dashboard';

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
    header.innerHTML = `<h2>Student Dashboard</h2>`;

    container.appendChild(header);
    container.appendChild(this.renderStatsCards());
    container.appendChild(this.renderAvailableExams());
    container.appendChild(this.renderRecentResults());

    return container;
  }
}