import AppState from '../../../services/state/AppState.js';
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

    // Bind methods to ensure correct context
    this.fetchSubmissions = this.fetchSubmissions.bind(this);
    this.setState = this.setState.bind(this);

    // Fetch submissions when component is created
    this.fetchSubmissions();
  }

  setState(newState) {
    // Merge new state with existing state
    this.state = { ...this.state, ...newState };
    
    // Re-render if container exists
    if (this.container) {
      this.container.innerHTML = '';
      this.container.appendChild(this.render());
    }
  }

  async fetchSubmissions() {
    try {
        console.log('Fetching submissions with params:', {
            examId: this.state.examId,
            classId: this.state.classId
        });

        const response = await window.api.getSubmissions();
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch submissions');
        }

        // Filter submissions for the current exam only
        const filteredSubmissions = response.data.filter(
            submission => submission.exam._id === this.state.examId
        );

        this.setState({ 
            submissions: filteredSubmissions,
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

    // Stats Cards Section
    const statsSection = this.renderStatsSection();
    this.container.appendChild(statsSection);

    // Question Statistics Section
    const questionStatsSection = this.renderQuestionStats();
    this.container.appendChild(questionStatsSection);

    // Submissions Table
    const submissionsTable = this.renderSubmissionsTable();
    this.container.appendChild(submissionsTable);

    return this.container;
}

renderStatsSection() {
    const section = document.createElement('div');
    section.className = 'stats-cards-section';

    const stats = this.calculateStats();
    
    const cards = [
        {
            title: 'Total Submissions',
            value: stats.totalSubmissions
        },
        {
            title: 'Graded',
            value: stats.gradedCount
        },
        {
            title: 'Pending',
            value: stats.pendingCount
        },
        {
            title: 'Average Score',
            value: `${stats.averageScore}%`
        }
    ];

    const grid = document.createElement('div');
    grid.className = 'stats-cards-grid';

    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'stat-card';
        cardElement.innerHTML = `
            <h3 class="stat-title">${card.title}</h3>
            <p class="stat-value">${card.value}</p>
        `;
        grid.appendChild(cardElement);
    });

    section.appendChild(grid);
    return section;
}

renderQuestionStats() {
  const section = document.createElement('div');
  section.className = 'question-stats-section';

  const questionStats = this.calculateQuestionStats();
  if (!questionStats.length) {
      section.innerHTML = `
          <h3>Question Performance</h3>
          <p class="no-stats-message">No graded submissions available for statistics.</p>
      `;
      return section;
  }

  section.innerHTML = `
      <h3>Question Performance</h3>
      <div class="question-stats-table">
          <table>
              <thead>
                  <tr>
                      <th>Question</th>
                      <th>Average Score</th>
                      <th>Max Points</th>
                      <th>Success Rate</th>
                  </tr>
              </thead>
              <tbody>
                  ${questionStats.map((stat, index) => `
                      <tr>
                          <td>Question ${index + 1}</td>
                          <td>${stat.averageScore.toFixed(1)} / ${stat.maxPoints}</td>
                          <td>${stat.maxPoints}</td>
                          <td>
                              <div class="progress-bar">
                                  <div class="progress" style="width: ${stat.successRate}%"></div>
                                  <span>${stat.successRate}%</span>
                              </div>
                          </td>
                      </tr>
                  `).join('')}
              </tbody>
          </table>
      </div>
  `;

  return section;
}

renderSubmissionsTable() {
  const table = document.createElement('div');
  table.className = 'submissions-table-container';

  if (this.state.loading) {
      table.innerHTML = '<div class="loading">Loading submissions...</div>';
      return table;
  }

  if (this.state.error) {
      table.innerHTML = `<div class="error-message">${this.state.error}</div>`;
      return table;
  }

  if (!this.state.submissions.length) {
      table.innerHTML = '<div class="empty-state">No submissions found</div>';
      return table;
  }

  table.innerHTML = `
  <table>
      <thead>
          <tr>
              <th>Student</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Score</th>
              <th>Time Spent</th>
              <th>Actions</th>
          </tr>
      </thead>
      <tbody>
          ${this.state.submissions.map(submission => {
              // Calculate submission score using our existing method
              const score = this.calculateSubmissionScore(submission);

              return `
                  <tr>
                      <td>${submission.student?.username || 'Unknown'}</td>
                      <td>${this.formatDate(submission.submitTime)}</td>
                      <td>
                          <span class="status-badge ${submission.status}">
                              ${submission.status}
                          </span>
                      </td>
                      <td>
                          ${submission.status === 'graded' 
                              ? `<span class="score">${score}%</span>`
                              : '-'}
                      </td>
                      <td>${this.formatTimeSpent(submission.answers)}</td>
                      <td>
                          <button class="btn btn-${submission.status === 'submitted' ? 'primary' : 'secondary'} grade-btn" 
                                  data-submission-id="${submission._id}">
                              ${submission.status === 'submitted' ? 'Grade' : 'Review'}
                          </button>
                      </td>
                  </tr>
              `;
          }).join('')}
      </tbody>
  </table>
`;

  // Add event listeners for buttons
  const gradeButtons = table.querySelectorAll('.grade-btn');
  gradeButtons.forEach(button => {
      button.addEventListener('click', () => {
          const submissionId = button.dataset.submissionId;
          AppState.navigateTo('gradingView', { submissionId });
      });
  });

  return table;
}

calculateSubmissionScore(submission) {
  if (submission.status !== 'graded') return 0;

  // Calculate total points available and earned
  let totalAvailable = 0;
  let totalEarned = 0;

  submission.answers.forEach(answer => {
      const question = submission.exam.questions.find(q => 
          q._id === answer.question || q._id === answer.questionId
      );
      if (question) {
          totalAvailable += question.points || 0;
          totalEarned += answer.score || 0;
      }
  });

  return totalAvailable > 0 ? Math.round((totalEarned / totalAvailable) * 100) : 0;
}

calculateStats() {
  const submissions = this.state.submissions;
  const gradedSubmissions = submissions.filter(s => s.status === 'graded');
  
  // Calculate scores for each graded submission
  const scores = gradedSubmissions.map(submission => {
      let totalAvailable = 0;
      let totalEarned = 0;

      submission.answers.forEach(answer => {
          const question = submission.exam.questions.find(q => 
              q._id === answer.question || q._id === answer.questionId
          );
          if (question) {
              totalAvailable += question.points || 0;
              totalEarned += answer.score || 0;
          }
      });

      return totalAvailable > 0 ? (totalEarned / totalAvailable) * 100 : 0;
  });

  // Calculate average score
  const averageScore = scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;

  return {
      totalSubmissions: submissions.length,
      gradedCount: gradedSubmissions.length,
      pendingCount: submissions.length - gradedSubmissions.length,
      averageScore
  };
}

calculateQuestionStats() {
  const gradedSubmissions = this.state.submissions.filter(s => s.status === 'graded');
  if (!gradedSubmissions.length) return [];

  // Get the exam structure from the first submission
  const examQuestions = gradedSubmissions[0]?.exam?.questions || [];
  
  const questionStats = {};

  gradedSubmissions.forEach(submission => {
      submission.answers.forEach((answer, index) => {
          const questionId = answer.question;
          if (!questionStats[questionId]) {
              // Find the corresponding question from exam questions
              const questionData = examQuestions[index];
              questionStats[questionId] = {
                  totalScore: 0,
                  count: 0,
                  maxPoints: questionData?.points || 0,
                  index: index
              };
          }
          
          if (answer.score !== null && answer.score !== undefined) {
              questionStats[questionId].totalScore += answer.score;
              questionStats[questionId].count++;
          }
      });
  });

  return Object.values(questionStats)
      .sort((a, b) => a.index - b.index)
      .map(stat => ({
          averageScore: stat.count > 0 ? stat.totalScore / stat.count : 0,
          maxPoints: stat.maxPoints,
          successRate: stat.maxPoints > 0 
              ? Math.round((stat.totalScore / (stat.count * stat.maxPoints)) * 100)
              : 0
      }));
}

formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

formatTimeSpent(answers) {
    const totalSeconds = answers.reduce((sum, answer) => sum + (answer.timeSpent || 0), 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
}
}