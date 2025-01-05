import ExamState from '../../services/state/ExamState.js';
import { formatDate } from '../../services/utils/formating.js';
import AppState from '../../services/state/AppState.js';

export default class StudentDashboard {
    constructor() {
        this.state = {
            stats: {
                totalExamsTaken: 0,
                averageScore: 0,
                pendingResults: 0
            },
            availableExams: [],
            loading: true,
            error: null
        };

        // Initialize
        this.loadDashboardData();
    }

    async loadDashboardData() {
        try {
            this.state.loading = true;
            this.updateUI();

            // Get available exams
            const examsResponse = await window.api.getExams();
            console.log('Exams response:', examsResponse);

            if (examsResponse.success) {
                // Filter for published exams only
                this.state.availableExams = examsResponse.data.filter(exam => 
                    exam.status === 'published'
                );
            }

            // Get exam stats if available
            try {
                const statsResponse = await window.api.getExamStats();
                console.log('Stats response:', statsResponse);
                if (statsResponse.success) {
                    this.state.stats = statsResponse.data;
                }
            } catch (error) {
                console.warn('Could not load exam stats:', error);
                // Continue without stats
            }

            this.state.loading = false;
            this.updateUI();

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.state.error = error.message;
            this.state.loading = false;
            this.updateUI();
        }
    }

    updateUI() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.container.appendChild(this.render());
    }

    renderStatsCards() {
        const container = document.createElement('div');
        container.className = 'stats-cards';

        const stats = [
            { 
                label: 'Available Exams', 
                value: this.state.availableExams.length 
            },
            { 
                label: 'Exams Taken', 
                value: this.state.stats.totalExamsTaken || 0 
            },
            { 
                label: 'Average Score', 
                value: `${Math.round(this.state.stats.averageScore || 0)}%` 
            },
            { 
                label: 'Pending Results', 
                value: this.state.stats.pendingResults || 0 
            }
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
        const section = document.createElement('div');
        section.className = 'dashboard-section';

        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <div class="header-content">
                <h2>Available Exams</h2>
            </div>
            <p class="section-description">Take your pending exams</p>
        `;

        const examGrid = document.createElement('div');
        examGrid.className = 'exam-grid';

        if (!this.state.availableExams.length) {
            examGrid.innerHTML = `
                <div class="empty-state">
                    <p>No exams available at the moment</p>
                    <p>Check back later for new exams</p>
                </div>
            `;
        } else {
            this.state.availableExams.forEach(exam => {
                const examCard = document.createElement('div');
                examCard.className = 'exam-card';
                examCard.innerHTML = `
                    <div class="exam-card-header">
                        <h3>${exam.title}</h3>
                        <span class="status-badge published">Available</span>
                    </div>
                    <div class="exam-card-stats">
                        <div class="stat">
                            <span class="label">Questions:</span>
                            <span class="value">${exam.questions?.length || 0}</span>
                        </div>
                        <div class="stat">
                            <span class="label">Class:</span>
                            <span class="value">${exam.class?.name || 'General'}</span>
                        </div>
                    </div>
                    <div class="exam-card-actions">
                        <button class="btn btn-primary start-exam-btn" data-exam-id="${exam._id}">
                            Start Exam
                        </button>
                    </div>
                `;

                const startButton = examCard.querySelector('.start-exam-btn');
                startButton.addEventListener('click', () => {
                    AppState.navigateTo('examTaker', { examId: exam._id });
                });

                examGrid.appendChild(examCard);
            });
        }

        section.appendChild(header);
        section.appendChild(examGrid);
        return section;
    }

    render() {
        this.container = document.createElement('div');
        this.container.className = 'student-dashboard';

        if (this.state.loading) {
            const loading = document.createElement('div');
            loading.className = 'loading';
            loading.textContent = 'Loading dashboard...';
            this.container.appendChild(loading);
            return this.container;
        }

        if (this.state.error) {
            const error = document.createElement('div');
            error.className = 'error-message';
            error.textContent = this.state.error;
            this.container.appendChild(error);
            return this.container;
        }

        this.container.appendChild(this.renderStatsCards());
        this.container.appendChild(this.renderAvailableExams());

        return this.container;
    }
}