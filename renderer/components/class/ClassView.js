// renderer/components/class/ClassView.js
import AppState from '../../services/state/AppState.js';

export default class ClassView {
    constructor(classId) {
        this.state = {
            classId,
            classData: null,
            loading: true,
            error: null
        };
        this.loadClassData();
    }

    async loadClassData() {
        try {
            const response = await window.api.getClass({ classId: this.state.classId });
            if (response.success) {
                this.setState({
                    classData: response.data,
                    loading: false
                });
            }
        } catch (error) {
            console.error('Failed to load class data:', error);
            this.setState({
                error: error.message,
                loading: false
            });
        }
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.updateUI();
    }

    updateUI() {
        if (!this.container) return;

        this.container.innerHTML = '';
        this.container.appendChild(this.render());
    }

    render() {
        this.container = document.createElement('div');
        this.container.className = 'class-view';

        if (this.state.loading) {
            this.container.innerHTML = '<div class="loading">Loading class data...</div>';
            return this.container;
        }

        if (this.state.error) {
            this.container.innerHTML = `
                <div class="error-message">${this.state.error}</div>
                <button class="btn btn-primary back-btn">Back to Dashboard</button>
            `;
            this.container.querySelector('.back-btn').addEventListener('click', () => {
                AppState.navigateTo('teacherDashboard');
            });
            return this.container;
        }

        if (!this.state.classData) {
            this.container.innerHTML = `
                <div class="error-message">Class not found</div>
                <button class="btn btn-primary back-btn">Back to Dashboard</button>
            `;
            this.container.querySelector('.back-btn').addEventListener('click', () => {
                AppState.navigateTo('teacherDashboard');
            });
            return this.container;
        }

        const { name, description, exams = [], students = [] } = this.state.classData;

        this.container.innerHTML = `
            <div class="class-header">
                <h2>${name}</h2>
                ${description ? `<p class="class-description">${description}</p>` : ''}
            </div>

            <div class="class-stats">
                <div class="stat-card">
                    <h3>Total Exams</h3>
                    <p>${exams.length}</p>
                </div>
                <div class="stat-card">
                    <h3>Total Students</h3>
                    <p>${students.length}</p>
                </div>
            </div>

            <div class="class-exams">
                <div class="section-header">
                    <h3>Exams</h3>
                    <button class="btn btn-primary create-exam-btn">Create New Exam</button>
                </div>
                <div class="exams-grid">
                    ${exams.length ? this.renderExams(exams) : '<p class="no-data">No exams created yet</p>'}
                </div>
            </div>

            <div class="class-students">
                <div class="section-header">
                    <h3>Students</h3>
                    <button class="btn btn-primary add-student-btn">Add Student</button>
                </div>
                <div class="students-list">
                    ${students.length ? this.renderStudents(students) : '<p class="no-data">No students enrolled yet</p>'}
                </div>
            </div>
        `;

        // Add event listeners
        this.container.querySelector('.create-exam-btn').addEventListener('click', () => {
            AppState.navigateTo('examCreator', { classId: this.state.classId });
        });

        this.container.querySelector('.add-student-btn').addEventListener('click', () => {
            // Implement add student functionality
            console.log('Add student clicked');
        });

        return this.container;
    }

    renderExams(exams) {
        return exams.map(exam => `
            <div class="exam-card">
                <h4>${exam.title}</h4>
                <div class="exam-status">
                    <span class="status-badge ${exam.status}">${exam.status}</span>
                </div>
                <div class="exam-actions">
                    <button class="btn btn-secondary view-exam-btn" data-exam-id="${exam._id}">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderStudents(students) {
        return `
            <table class="students-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${students.map(student => `
                        <tr>
                            <td>${student.username}</td>
                            <td>${student.email}</td>
                            <td>
                                <button class="btn btn-secondary btn-sm">View Progress</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
}