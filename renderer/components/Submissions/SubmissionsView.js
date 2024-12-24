// renderer/components/Submissions/SubmissionsView.js
import DOMHelper from '../../helpers/DOMHelper.js';

export default class SubmissionsView {
  constructor(submissions) {
    this.submissions = submissions;
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

    if (this.submissions.length === 0) {
      const noSubmissions = DOMHelper.createElement('p', {
        text: 'No submissions found.',
        classes: ['no-submissions']
      });
      container.appendChild(noSubmissions);
      return container;
    }

    const table = this.createSubmissionsTable();
    container.appendChild(table);

    return container;
  }

  createSubmissionsTable() {
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
        <td><span class="status-badge ${submission.status}">${submission.status}</span></td>
        <td>${submission.status === 'graded' ? `${submission.totalScore}%` : '-'}</td>
      `;

      const actionCell = DOMHelper.createElement('td');
      actionCell.appendChild(actionButton);
      row.appendChild(actionCell);

      tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    return table;
  }

  handleSubmissionAction(submission) {
    // Implement grading or review functionality
    console.log('Handle submission:', submission);
    // You can implement the grading interface here
  }
}

