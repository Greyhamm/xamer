import AppState from '../../services/state/AppState.js';
import AddStudentsModal from './AddStudentsModal.js';
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


    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString();
    }

    async removeStudent(studentId) {
        try {
            await window.api.removeStudentFromClass(this.state.classId, studentId);
            await this.loadClassData(); // Refresh the view
        } catch (error) {
            console.error('Failed to remove student:', error);
            // You might want to show an error message to the user here
        }
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

    renderOverviewSection() {
        const { name, description, students = [], exams = [] } = this.state.classData;
        
        const section = document.createElement('div');
        section.className = 'dashboard-section overview-section';
        
        section.innerHTML = `
            <div class="section-header">
                <h2>${name}</h2>
                <p class="section-description">${description || 'No description provided'}</p>
            </div>
            <div class="stats-cards">
                <div class="stat-card">
                    <h3>Total Students</h3>
                    <p class="stat-value">${students.length}</p>
                </div>
                <div class="stat-card">
                    <h3>Total Exams</h3>
                    <p class="stat-value">${exams.length}</p>
                </div>
                <div class="stat-card">
                    <h3>Published Exams</h3>
                    <p class="stat-value">${exams.filter(exam => exam.status === 'published').length}</p>
                </div>
                <div class="stat-card">
                    <h3>Draft Exams</h3>
                    <p class="stat-value">${exams.filter(exam => exam.status === 'draft').length}</p>
                </div>
            </div>
        `;

        return section;
    }

    renderExamsSection() {
        const section = document.createElement('div');
        section.className = 'dashboard-section exams-section';
        
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <div class="header-content">
                <h2>Exams</h2>
                <button class="btn btn-primary create-exam-btn">Create New Exam</button>
            </div>
            <p class="section-description">Manage and monitor all exams for this class</p>
        `;

        const createExamBtn = header.querySelector('.create-exam-btn');
        createExamBtn.addEventListener('click', () => {
            AppState.navigateTo('examCreator', { classId: this.state.classId });
        });

        const examGrid = document.createElement('div');
        examGrid.className = 'exam-grid';

        if (!this.state.classData.exams?.length) {
            examGrid.innerHTML = `
                <div class="empty-state">
                    <p>No exams have been created yet</p>
                    <p>Click "Create New Exam" to get started</p>
                </div>
            `;
        } else {
            this.state.classData.exams.forEach(exam => {
                const examCard = document.createElement('div');
                examCard.className = 'exam-card';
                examCard.innerHTML = `
                    <div class="exam-card-header">
                        <h3>${exam.title}</h3>
                        <span class="status-badge ${exam.status}">${exam.status}</span>
                    </div>
                    <div class="exam-card-stats">
                        <div class="stat">
                            <span class="label">Questions:</span>
                            <span class="value">${exam.questions.length}</span>
                        </div>
                        <div class="stat">
                            <span class="label">Created:</span>
                            <span class="value">${new Date(exam.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="exam-card-actions">
                        <button class="btn btn-secondary view-btn">View Details</button>
                        ${exam.status === 'draft' ? 
                            '<button class="btn btn-primary publish-btn">Publish</button>' : 
                            '<button class="btn btn-secondary submissions-btn">View Submissions</button>'}
                    </div>
                `;

                // Add event listeners
                const publishBtn = examCard.querySelector('.publish-btn');
                if (publishBtn) {
                    publishBtn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        try {
                            await window.api.publishExam(exam._id);
                            await this.loadClassData();
                        } catch (error) {
                            console.error('Failed to publish exam:', error);
                        }
                    });
                }

                examGrid.appendChild(examCard);
            });
        }

        section.appendChild(header);
        section.appendChild(examGrid);
        return section;
    }

    renderStudentsSection() {
        const section = document.createElement('div');
        section.className = 'dashboard-section students-section';
        
        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `
            <div class="header-content">
                <h2>Students</h2>
                <button class="btn btn-primary add-student-btn">Add Student</button>
            </div>
            <p class="section-description">Manage enrolled students and their progress</p>
        `;

        // Add student button handler
        header.querySelector('.add-student-btn').addEventListener('click', () => {
            const addStudentsModal = new AddStudentsModal({
                classId: this.state.classId,
                onSubmit: async (addedStudents) => {
                    await this.loadClassData();
                }
            });
            document.body.appendChild(addStudentsModal.render());
        });

        const studentsList = document.createElement('div');
        studentsList.className = 'students-list';

        if (!this.state.classData.students?.length) {
            studentsList.innerHTML = `
                <div class="empty-state">
                    <p>No students enrolled yet</p>
                    <p>Add students to begin tracking their progress</p>
                </div>
            `;
        } else {
            studentsList.innerHTML = `
                <table class="students-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Joined Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.state.classData.students.map(student => `
                            <tr data-student-id="${student._id}">
                                <td>${student.username}</td>
                                <td>${student.email}</td>
                                <td>${this.formatDate(student.createdAt)}</td>
                                <td class="action-buttons">
                                    <button class="btn btn-secondary btn-sm view-progress-btn">
                                        View Progress
                                    </button>
                                    <button class="btn btn-danger btn-sm remove-student-btn">
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            // Add event listeners for remove buttons
            const tbody = studentsList.querySelector('tbody');
            tbody.addEventListener('click', async (e) => {
                const button = e.target.closest('button');
                if (!button) return;

                const row = button.closest('tr');
                const studentId = row.dataset.studentId;

                if (button.classList.contains('remove-student-btn')) {
                    if (confirm('Are you sure you want to remove this student from the class?')) {
                        await this.removeStudent(studentId);
                    }
                }
            });
        }

        section.appendChild(header);
        section.appendChild(studentsList);
        return section;
    }

    render() {
        this.container = document.createElement('div');
        this.container.className = 'class-view-container';

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

        // Add all sections
        this.container.appendChild(this.renderOverviewSection());
        this.container.appendChild(this.renderExamsSection());
        this.container.appendChild(this.renderStudentsSection());

        return this.container;
    }
}