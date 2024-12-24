// renderer/components/Dashboard/StudentDashboard.js
import DOMHelper from '../../helpers/DOMHelper.js';
import ExamTaker from '../ExamTaker.js';
// renderer/components/Dashboard/StudentDashboard.js
export default class StudentDashboard {
    constructor(user) {
      this.user = user;
      this.state = {
        stats: null,
        availableExams: [],
        loading: true
      };
    }
  
    async fetchData() {
      try {
        const [stats, exams] = await Promise.all([
          window.api.getStudentStats(),
          window.api.getExams()
        ]);
  
        // Ensure stats has default values
        this.state.stats = {
          totalExamsTaken: 0,
          examsPending: 0,
          averageScore: 0,
          recentResults: [],
          ...stats
        };
  
        // Filter and process exams
        this.state.availableExams = exams.filter(exam => 
          exam && exam.status === 'published'
        ).map(exam => ({
          ...exam,
          questions: exam.questions || [] // Ensure questions is always an array
        }));
  
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        this.state.loading = false;
      }
    }
  
    createAvailableExamsTable() {
      const container = DOMHelper.createElement('div', {
        classes: ['available-exams-section']
      });
  
      const title = DOMHelper.createElement('h3', {
        text: 'Available Exams',
        classes: ['section-title']
      });
  
      if (!this.state.availableExams || this.state.availableExams.length === 0) {
        const noExams = DOMHelper.createElement('p', {
          text: 'No exams are available at the moment.',
          classes: ['no-data-message']
        });
        container.appendChild(title);
        container.appendChild(noExams);
        return container;
      }
  
      const table = DOMHelper.createElement('table', {
        classes: ['data-table']
      });
  
      const thead = DOMHelper.createElement('thead');
      thead.innerHTML = `
        <tr>
          <th>Exam Title</th>
          <th>Questions</th>
          <th>Action</th>
        </tr>
      `;
  
      const tbody = DOMHelper.createElement('tbody');
      this.state.availableExams.forEach(exam => {
        const row = DOMHelper.createElement('tr');
        
        // Get question count safely
        const questionCount = exam.questions ? exam.questions.length : 0;
  
        const takeButton = DOMHelper.createElement('button', {
          classes: ['btn', 'btn-primary'],
          text: 'Take Exam'
        });
  
        takeButton.addEventListener('click', async () => {
            const examTaker = new ExamTaker();
            try {
              await examTaker.loadExam(exam._id);
              const mainContent = document.getElementById('main-content');
              mainContent.innerHTML = '';
              mainContent.appendChild(examTaker.renderExam(mainContent));
            } catch (error) {
              console.error('Error loading exam:', error);
              alert('Failed to load exam. Please try again.');
            }
          });
  
        row.innerHTML = `
          <td>${exam.title || 'Untitled Exam'}</td>
          <td>${questionCount} question${questionCount === 1 ? '' : 's'}</td>
        `;
        
        const actionCell = DOMHelper.createElement('td');
        actionCell.appendChild(takeButton);
        row.appendChild(actionCell);
        
        tbody.appendChild(row);
      });
  
      table.appendChild(thead);
      table.appendChild(tbody);
      container.appendChild(title);
      container.appendChild(table);
  
      return container;
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
    
        header.appendChild(title);
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
              title: 'Exams Taken',
              value: this.state.stats.totalExamsTaken
            },
            {
              title: 'Pending Exams',
              value: this.state.stats.examsPending
            },
            {
              title: 'Average Score',
              value: `${Math.round(this.state.stats.averageScore)}%`
            }
          ];
    
          statCards.forEach(stat => {
            const card = this.createStatCard(stat.title, stat.value);
            statsContainer.appendChild(card);
          });
    
          container.appendChild(statsContainer);
    
          // Recent Results
          if (this.state.stats.recentResults.length > 0) {
            container.appendChild(this.createRecentResultsTable());
          }
    
          // Available Exams
          if (this.state.availableExams.length > 0) {
            container.appendChild(this.createAvailableExamsTable());
          } else {
            const noExams = DOMHelper.createElement('p', {
              classes: ['no-exams-message'],
              text: 'No exams available at the moment.'
            });
            container.appendChild(noExams);
          }
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

  createRecentResultsTable() {
    const container = DOMHelper.createElement('div', {
      classes: ['results-section']
    });

    const title = DOMHelper.createElement('h3', {
      text: 'Recent Results',
      classes: ['section-title']
    });

    const table = DOMHelper.createElement('table', {
      classes: ['data-table']
    });

    const thead = DOMHelper.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Exam</th>
        <th>Score</th>
        <th>Date</th>
      </tr>
    `;

    const tbody = DOMHelper.createElement('tbody');
    this.state.stats.recentResults.forEach(result => {
      const row = DOMHelper.createElement('tr');
      row.innerHTML = `
        <td>${result.examTitle}</td>
        <td>${result.score}%</td>
        <td>${new Date(result.gradedAt).toLocaleDateString()}</td>
      `;
      tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(title);
    container.appendChild(table);

    return container;
  }


}