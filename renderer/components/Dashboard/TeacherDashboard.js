// renderer/components/Dashboard/TeacherDashboard.js
import DOMHelper from '../../helpers/DOMHelper.js';
import ExamCreator from '../ExamCreator.js';
export default class TeacherDashboard {
  constructor(user) {
    this.user = user;
    this.state = {
      stats: null,
      recentSubmissions: [],
      loading: true
    };
  }

  async fetchData() {
    try {
      const [stats, submissions] = await Promise.all([
        window.api.getTeacherStats(),
        window.api.getSubmissions()
      ]);
      this.state.stats = stats;
      this.state.recentSubmissions = submissions
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 5);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      this.state.loading = false;
    }
  }

  render() {
    const container = DOMHelper.createElement('div', {
      classes: ['dashboard']
    });

    // Dashboard Header
    const header = DOMHelper.createElement('div', {
      classes: ['dashboard-header']
    });

    const title = DOMHelper.createElement('h2', {
      classes: ['dashboard-title'],
      text: `Welcome, ${this.user.username}!`
    });

    const createExamBtn = DOMHelper.createElement('button', {
      classes: ['btn', 'btn-add'],
      text: 'Create New Exam'
    });

    createExamBtn.addEventListener('click', () => {
      const examCreator = new ExamCreator();
      const mainContent = document.getElementById('main-content');
      mainContent.innerHTML = '';
      mainContent.appendChild(examCreator.render());
    });

    header.appendChild(title);
    header.appendChild(createExamBtn);
    container.appendChild(header);

    // Loading State
    const loadingDiv = DOMHelper.createElement('div', {
      classes: ['loading-container'],
      text: 'Loading dashboard...'
    });
    container.appendChild(loadingDiv);

    // Fetch and render data
    this.fetchData().then(() => {
      loadingDiv.remove();
      
      // Stats Cards
      const statsContainer = DOMHelper.createElement('div', {
        classes: ['dashboard-stats']
      });

      // Create stat cards
      const statCards = [
        {
          title: 'Total Exams',
          value: this.state.stats.totalExams
        },
        {
          title: 'Published Exams',
          value: this.state.stats.publishedExams
        },
        {
          title: 'Total Submissions',
          value: this.state.stats.totalSubmissions
        },
        {
          title: 'Pending Grading',
          value: this.state.stats.pendingGrading
        }
      ];

      statCards.forEach(stat => {
        const card = this.createStatCard(stat.title, stat.value);
        statsContainer.appendChild(card);
      });

      container.appendChild(statsContainer);

      // Recent Submissions
      if (this.state.recentSubmissions.length > 0) {
        container.appendChild(this.createRecentSubmissionsTable());
      }

      // Quick Actions
      container.appendChild(this.createQuickActions());
    });

    return container;
  }

  createStatCard(title, value) {
    const card = DOMHelper.createElement('div', {
      classes: ['stat-card']
    });

    const titleElement = DOMHelper.createElement('div', {
      classes: ['stat-title'],
      text: title
    });

    const valueElement = DOMHelper.createElement('div', {
      classes: ['stat-value'],
      text: value
    });

    card.appendChild(titleElement);
    card.appendChild(valueElement);

    return card;
  }

  createRecentSubmissionsTable() {
    const container = DOMHelper.createElement('div', {
      classes: ['submissions-section']
    });

    const title = DOMHelper.createElement('h3', {
      text: 'Recent Submissions',
      classes: ['section-title']
    });

    const table = DOMHelper.createElement('table', {
      classes: ['data-table']
    });

    const thead = DOMHelper.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Student</th>
        <th>Exam</th>
        <th>Status</th>
        <th>Submitted</th>
        <th>Action</th>
      </tr>
    `;

    const tbody = DOMHelper.createElement('tbody');
    this.state.recentSubmissions.forEach(submission => {
      const row = DOMHelper.createElement('tr');
      
      const statusClass = submission.status === 'graded' ? 'status-graded' : 'status-submitted';
      const actionButton = DOMHelper.createElement('button', {
        classes: ['btn', submission.status === 'graded' ? 'btn-secondary' : 'btn-primary'],
        text: submission.status === 'graded' ? 'Review' : 'Grade'
      });

      actionButton.addEventListener('click', () => {
        // Navigate to grading view
        // Implementation needed
      });

      row.innerHTML = `
        <td>${submission.student.username}</td>
        <td>${submission.exam.title}</td>
        <td><span class="status-badge ${statusClass}">${submission.status}</span></td>
        <td>${new Date(submission.submittedAt).toLocaleDateString()}</td>
      `;

      const actionCell = DOMHelper.createElement('td');
      actionCell.appendChild(actionButton);
      row.appendChild(actionCell);
      
      tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(title);
    container.appendChild(table);

    return container;
  }

  createQuickActions() {
    const container = DOMHelper.createElement('div', {
      classes: ['quick-actions']
    });

    const title = DOMHelper.createElement('h3', {
      text: 'Quick Actions',
      classes: ['section-title']
    });

    const actions = DOMHelper.createElement('div', {
      classes: ['action-buttons']
    });

    const viewAllExamsBtn = DOMHelper.createElement('button', {
      classes: ['btn', 'btn-secondary'],
      text: 'View All Exams'
    });

    const viewAllSubmissionsBtn = DOMHelper.createElement('button', {
      classes: ['btn', 'btn-secondary'],
      text: 'View All Submissions'
    });

    viewAllExamsBtn.addEventListener('click', () => {
      // Navigate to exams list
      // Implementation needed
    });

    viewAllSubmissionsBtn.addEventListener('click', () => {
      // Navigate to submissions list
      // Implementation needed
    });

    actions.appendChild(viewAllExamsBtn);
    actions.appendChild(viewAllSubmissionsBtn);
    container.appendChild(title);
    container.appendChild(actions);

    return container;
  }
}