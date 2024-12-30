import SubmissionAPI from '../../../services/api/submissionAPI.js';
import GradingView from './GradingView.js';
import { formatDate } from '../../../services/utils/formatting.js';

export default class SubmissionsList {
  constructor() {
    this.state = {
      submissions: [],
      loading: true,
      error: null,
      filters: {
        status: 'all',
        search: ''
      }
    };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.updateUI();
  }

  async loadSubmissions() {
    try {
      const submissions = await SubmissionAPI.getSubmissions();
      this.setState({ submissions, loading: false });
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  }

  filterSubmissions() {
    let filtered = [...this.state.submissions];

    if (this.state.filters.status !== 'all') {
      filtered = filtered.filter(sub => sub.status === this.state.filters.status);
    }

    if (this.state.filters.search) {
      const search = this.state.filters.search.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.student.username.toLowerCase().includes(search) ||
        sub.exam.title.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  openGradingView(submission) {
    const mainContent = document.querySelector('#main-content');
    const gradingView = new GradingView(submission, () => {
      this.loadSubmissions();
      this.render();
    });
    mainContent.innerHTML = '';
    mainContent.appendChild(gradingView.render());
  }

  render() {
    const container = document.createElement('div');
    container.className = 'submissions-list-container';

    // Header
    const header = document.createElement('div');
    header.className = 'submissions-header';
    header.innerHTML = `<h2>Exam Submissions</h2>`;

    // Filters
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'submissions-filters';

    const statusSelect = document.createElement('select');
    statusSelect.className = 'filter-select';
    statusSelect.innerHTML = `
      <option value="all">All Status</option>
      <option value="submitted">Pending Grading</option>
      <option value="graded">Graded</option>
    `;
    statusSelect.value = this.state.filters.status;
    statusSelect.addEventListener('change', (e) => {
      this.setState({
        filters: { ...this.state.filters, status: e.target.value }
      });
    });

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'filter-search';
    searchInput.placeholder = 'Search by student or exam...';
    searchInput.value = this.state.filters.search;
    searchInput.addEventListener('input', (e) => {
      this.setState({
        filters: { ...this.state.filters, search: e.target.value }
      });
    });

    filtersContainer.appendChild(statusSelect);
    filtersContainer.appendChild(searchInput);

    // Submissions table
    const table = document.createElement('table');
    table.className = 'submissions-table';
    
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Student</th>
        <th>Exam</th>
        <th>Submitted</th>
        <th>Status</th>
        <th>Score</th>
        <th>Actions</th>
      </tr>
    `;

    const tbody = document.createElement('tbody');
    const filteredSubmissions = this.filterSubmissions();

    if (this.state.loading) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="loading-cell">Loading submissions...</td>
        </tr>
      `;
    } else if (this.state.error) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="error-cell">${this.state.error}</td>
        </tr>
      `;
    } else if (filteredSubmissions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-cell">No submissions found</td>
        </tr>
      `;
    } else {
      filteredSubmissions.forEach(submission => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${submission.student.username}</td>
          <td>${submission.exam.title}</td>
          <td>${formatDate(submission.submittedAt)}</td>
          <td>
            <span class="status-badge ${submission.status}">
              ${submission.status}
            </span>
          </td>
          <td>${submission.totalScore !== null ? `${submission.totalScore}%` : '-'}</td>
          <td>
            <button class="btn btn-${submission.status === 'graded' ? 'secondary' : 'primary'}">
              ${submission.status === 'graded' ? 'Review' : 'Grade'}
            </button>
          </td>
        `;

        const actionButton = row.querySelector('button');
        actionButton.addEventListener('click', () => this.openGradingView(submission));

        tbody.appendChild(row);
      });
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    // Assemble container
    container.appendChild(header);
    container.appendChild(filtersContainer);
    container.appendChild(table);

    return container;
  }
}