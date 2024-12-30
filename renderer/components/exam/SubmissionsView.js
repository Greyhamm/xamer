// renderer/components/Submissions/SubmissionsView.js
import DOMHelper from '../../services/utils/DOMHelper.js';  
import GradingView from './GradingView.js';
export default class SubmissionsView {
  constructor() {
    this.submissions = [];
    this.loading = true;
  }

  async fetchSubmissions() {
    try {
      const submissions = await window.api.getSubmissions();
      console.log('Fetched submissions:', submissions);
      this.submissions = submissions;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  render() {
    const container = DOMHelper.createElement('div', {
      classes: ['submissions-container']
    });

    const header = DOMHelper.createElement('div', {
      classes: ['submissions-header']
    });

    const title = DOMHelper.createElement('h2', {
      text: 'Exam Submissions',
      classes: ['submissions-title']
    });

    header.appendChild(title);
    container.appendChild(header);

    // Loading message
    const loadingMsg = DOMHelper.createElement('p', {
      text: 'Loading submissions...',
      classes: ['loading-message']
    });
    container.appendChild(loadingMsg);

    // Fetch and render submissions
    this.fetchSubmissions().then(() => {
      container.removeChild(loadingMsg);

      if (this.submissions.length === 0) {
        const noSubmissions = DOMHelper.createElement('p', {
          text: 'No submissions found.',
          classes: ['no-data-message']
        });
        container.appendChild(noSubmissions);
        return;
      }

      const table = DOMHelper.createElement('table', {
        classes: ['data-table']
      });

      const thead = DOMHelper.createElement('thead');
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

      const tbody = DOMHelper.createElement('tbody');
      this.submissions.forEach(submission => {
        const row = DOMHelper.createElement('tr');
        
        const actionButton = DOMHelper.createElement('button', {
          classes: ['btn', submission.status === 'graded' ? 'btn-secondary' : 'btn-primary'],
          text: submission.status === 'graded' ? 'Review' : 'Grade'
        });

        actionButton.addEventListener('click', () => this.handleSubmissionAction(submission));

        row.innerHTML = `
          <td>${submission.student.username}</td>
          <td>${submission.exam.title}</td>
          <td>${new Date(submission.submittedAt).toLocaleDateString()}</td>
          <td>
            <span class="status-badge ${submission.status}">
              ${submission.status}
            </span>
          </td>
          <td>${submission.status === 'graded' ? `${submission.totalScore}%` : '-'}</td>
        `;

        const actionCell = DOMHelper.createElement('td');
        actionCell.appendChild(actionButton);
        row.appendChild(actionCell);

        tbody.appendChild(row);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      container.appendChild(table);
    }).catch(error => {
      container.innerHTML = `
        <p class="error-message">Error loading submissions: ${error.message}</p>
      `;
    });

    return container;
  }

    // Update the handleSubmissionAction method
    handleSubmissionAction(submission) {
        if (submission.status === 'graded') {
        this.reviewSubmission(submission);
        } else {
        this.gradeSubmission(submission);
        }
    }

  reviewSubmission(submission) {
    // For now, use the same grading view but in read-only mode
    const gradingView = new GradingView(submission);
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';
    mainContent.appendChild(gradingView.render());
  }
  
  gradeSubmission(submission) {
    const gradingView = new GradingView(submission);
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '';
    mainContent.appendChild(gradingView.render());
  }
}