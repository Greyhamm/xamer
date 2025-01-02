import ExamState from '../../services/state/ExamState.js';
import SubmissionAPI from '../../services/api/submissionAPI.js';
import { formatDate } from '../../services/utils/formating.js';
import AppState from '../../services/state/AppState.js';
import CreateClassModal from '../class/CreateClassModal.js';

export default class TeacherDashboard {
  constructor() {
    this.state = {
      stats: null,
      recentExams: [],
      classes: [],
      loading: true,
      error: null
    };

    // Bind all methods in constructor
    this.loadDashboardData = this.loadDashboardData.bind(this);
    this.updateUI = this.updateUI.bind(this);
    this.render = this.render.bind(this);
    this.loadClasses = this.loadClasses.bind(this);
    this.createClass = this.createClass.bind(this);
    this.showCreateClassModal = this.showCreateClassModal.bind(this);
    this.renderClassesSection = this.renderClassesSection.bind(this);
    this.renderStatsCards = this.renderStatsCards.bind(this);
    // this.renderRecentExams = this.renderRecentExams.bind(this);

    // Initialize the dashboard
    this.loadDashboardData();
  }

  updateUI() {
    const dashboardContainer = document.querySelector('.teacher-dashboard');
    if (dashboardContainer) {
      dashboardContainer.innerHTML = '';
      dashboardContainer.appendChild(this.render());
    }
  }

  async loadDashboardData() {
    try {
      this.state.loading = true;
      this.updateUI();

      await Promise.all([
        ExamState.getStats(),
        ExamState.getRecentExams(),
        this.loadClasses()
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

  async loadClasses() {
    try {
      const response = await window.api.getClasses();
      if (response.success) {
        this.state.classes = response.data;
      }
    } catch (error) {
      console.error('Failed to load classes:', error);
      this.state.classes = [];
    }
  }

  async createClass(classData) {
    try {
      const response = await window.api.createClass({
        data: classData
      });

      if (response.success) {
        await this.loadClasses();
        this.updateUI();
      }
    } catch (error) {
      console.error('Failed to create class:', error);
      throw error;
    }
  }

  showCreateClassModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Create New Class</h3>
            <button class="close-btn">&times;</button>
          </div>
          <form class="modal-form">
            <div class="form-group">
              <label for="className">Class Name*</label>
              <input type="text" id="className" required>
            </div>
            <div class="form-group">
              <label for="classDescription">Description</label>
              <textarea id="classDescription" rows="3"></textarea>
            </div>
            <div class="error-message" style="display: none;"></div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
              <button type="submit" class="btn btn-primary">Create Class</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const closeModal = () => modal.remove();

    modal.querySelector('.close-btn').addEventListener('click', closeModal);
    modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
    modal.querySelector('.modal-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorMessage = modal.querySelector('.error-message');
      try {
        const formData = {
          name: modal.querySelector('#className').value,
          description: modal.querySelector('#classDescription').value
        };
        await this.createClass(formData);
        closeModal();
      } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
      }
    });

    document.body.appendChild(modal);
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
      { label: 'Total Exams', value: this.state.stats.totalExams || 0 },
      { label: 'Published Exams', value: this.state.stats.publishedExams || 0 },
      { label: 'Pending Grades', value: this.state.stats.pendingGrading || 0 },
      { label: 'Total Submissions', value: this.state.stats.totalSubmissions || 0 }
    ];

    stats.forEach(stat => {
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `<h4>${stat.label}</h4><p>${stat.value}</p>`;
      container.appendChild(card);
    });

    return container;
  }

  renderClassesSection() {
    const section = document.createElement('div');
    section.className = 'dashboard-section classes-section';

    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `
      <h3>Your Classes</h3>
      <button class="btn btn-primary create-class-btn">
        Create New Class
      </button>
    `;

    header.querySelector('.create-class-btn').addEventListener('click', () => this.showCreateClassModal());

    const classesGrid = document.createElement('div');
    classesGrid.className = 'classes-grid';

    if (!this.state.classes?.length) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <p>You haven't created any classes yet.</p>
        <p>Create a class to start organizing your exams!</p>
      `;
      classesGrid.appendChild(emptyState);
    } else {
      this.state.classes.forEach(classData => {
        const classCard = document.createElement('div');
        classCard.className = 'class-card';
        classCard.innerHTML = `
          <div class="class-header">
            <h4>${classData.name}</h4>
            <p>${classData.description || ''}</p>
          </div>
          <div class="class-stats">
            <div>Students: ${classData.students?.length || 0}</div>
            <div>Exams: ${classData.exams?.length || 0}</div>
          </div>
          <div class="class-actions">
            <button class="btn btn-primary create-exam-btn">Create Exam</button>
            <button class="btn btn-secondary view-exams-btn">View Exams</button>
          </div>
        `;

        classCard.querySelector('.create-exam-btn').addEventListener('click', () => {
          window.location.hash = `#/exam/create/${classData._id}`;
        });

        classCard.querySelector('.view-exams-btn').addEventListener('click', () => {
          window.location.hash = `#/class/${classData._id}/exams`;
        });

        classesGrid.appendChild(classCard);
      });
    }

    section.appendChild(header);
    section.appendChild(classesGrid);
    return section;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'teacher-dashboard';

    if (this.state.loading) {
      const loading = document.createElement('div');
      loading.className = 'loading';
      loading.textContent = 'Loading dashboard...';
      container.appendChild(loading);
      return container;
    }

    if (this.state.error) {
      const error = document.createElement('div');
      error.className = 'error-message';
      error.textContent = this.state.error;
      container.appendChild(error);
      return container;
    }

    container.appendChild(this.renderStatsCards());
    container.appendChild(this.renderClassesSection());
    // container.appendChild(this.renderRecentExams());

    return container;
  }
}