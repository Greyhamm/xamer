export default class SubmissionsList {
  constructor(options = {}) {
      this.state = {
          submissions: [],
          loading: true,
          error: null,
          examId: options.examId,
          classId: options.classId,
          filters: {
              status: 'all',
              search: ''
          }
      };

      // Fetch submissions when component is created
      this.fetchSubmissions();
  }

  async fetchSubmissions() {
      try {
          console.log('Fetching submissions with params:', {
              examId: this.state.examId,
              classId: this.state.classId
          });

          const response = await window.api.getSubmissions();
          
          console.log('Raw submissions response:', response);

          // Ensure response has data and success flag
          if (!response || !response.data) {
              throw new Error('No submissions data received');
          }

          // Filter submissions by exam ID if provided
          let submissions = response.data || [];
          if (this.state.examId) {
              submissions = submissions.filter(
                  submission => submission.exam?._id === this.state.examId
              );
          }

          this.setState({ 
              submissions, 
              loading: false 
          });
      } catch (error) {
          console.error('Error fetching submissions:', error);
          this.setState({
              error: error.message || 'Failed to fetch submissions',
              loading: false,
              submissions: []
          });
      }
  }

  render() {
      this.container = document.createElement('div');
      this.container.className = 'submissions-list-container';

      // Header
      const header = document.createElement('div');
      header.className = 'submissions-header';
      
      // Error handling
      if (this.state.error) {
          header.innerHTML = `<h2>Error</h2>`;
          const errorMessage = document.createElement('div');
          errorMessage.className = 'error-message';
          errorMessage.textContent = this.state.error;
          this.container.appendChild(header);
          this.container.appendChild(errorMessage);
          return this.container;
      }

      // Loading state
      if (this.state.loading) {
          header.innerHTML = `<h2>Loading Submissions...</h2>`;
          this.container.appendChild(header);
          return this.container;
      }

      // Normal rendering
      header.innerHTML = `<h2>Exam Submissions</h2>`;
      this.container.appendChild(header);

      // Submissions table
      const table = document.createElement('table');
      table.className = 'submissions-table';
      
      // If no submissions
      if (this.state.submissions.length === 0) {
          const noSubmissionsMessage = document.createElement('div');
          noSubmissionsMessage.className = 'no-submissions-message';
          noSubmissionsMessage.textContent = 'No submissions found.';
          this.container.appendChild(noSubmissionsMessage);
          return this.container;
      }

      // Rest of the rendering remains the same as in the previous implementation
      table.innerHTML = `
          <thead>
              <tr>
                  <th>Student</th>
                  <th>Exam</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
              </tr>
          </thead>
          <tbody>
              ${this.state.submissions.map(submission => `
                  <tr>
                      <td>${submission.student?.username || 'Unknown'}</td>
                      <td>${submission.exam?.title || 'Unknown Exam'}</td>
                      <td>${submission.submitTime ? new Date(submission.submitTime).toLocaleDateString() : 'N/A'}</td>
                      <td>
                          <span class="status-badge ${submission.status}">
                              ${submission.status}
                          </span>
                      </td>
                      <td>
                          <button class="btn btn-${submission.status === 'submitted' ? 'primary' : 'secondary'} grade-btn" 
                                  data-submission-id="${submission._id}">
                              ${submission.status === 'submitted' ? 'Grade' : 'Review'}
                          </button>
                      </td>
                  </tr>
              `).join('')}
          </tbody>
      `;

      // Add event listeners for grade/review buttons
      table.addEventListener('click', (e) => {
          const gradeButton = e.target.closest('.grade-btn');
          if (gradeButton) {
              const submissionId = gradeButton.dataset.submissionId;
              console.log('Grade/Review submission:', submissionId);
              
              // Navigate to grading view
              AppState.navigateTo('gradingView', { 
                  submissionId,
                  examId: this.state.examId,
                  classId: this.state.classId
              });
          }
      });

      this.container.appendChild(table);

      return this.container;
  }
}