/**
 * Manages the modal for adding students to a class
 * Provides search functionality, student selection, and bulk addition
 */
export default class AddStudentsModal {
    /**
     * Initialize the add students modal
     * @param {Object} options - Configuration options for the modal
     * @param {Function} [options.onClose] - Callback when modal is closed
     * @param {Function} [options.onSubmit] - Callback when students are added
     * @param {string} options.classId - ID of the class to add students to
     */
    constructor(options = {}) {
        this.onClose = options.onClose;
        this.onSubmit = options.onSubmit;
        this.classId = options.classId;
        
        // Initialize component state
        this.state = {
            searchTerm: '',
            searchResults: [],
            selectedStudents: [],
            loading: false,
            error: null
        };

        this.searchTimeout = null;
    }

    /**
     * Update the component's state and trigger UI update
     * @param {Object} newState - New state to merge with existing state
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.updateUI();
    }

    /**
     * Perform student search based on input term
     * @param {string} term - Search term for finding students
     */
    async searchStudents(term) {
        if (!term || term.length < 2) {
            this.setState({ 
                searchResults: [],
                error: null,
                loading: false 
            });
            return;
        }

        try {
            this.setState({ loading: true, error: null });
            const response = await window.api.searchStudents({
                classId: this.classId,
                data: { query: term }
            });

            if (response.success) {
                this.setState({ 
                    searchResults: response.data,
                    error: null 
                });
            } else {
                throw new Error(response.error || 'Failed to search students');
            }
        } catch (error) {
            console.error('Search error:', error);
            if (!error.message.includes('2 characters')) {
                this.setState({ error: error.message });
            }
        } finally {
            this.setState({ loading: false });
        }
    }

    /**
     * Handle search input with debounce
     * @param {string} value - Search input value
     */
    handleSearchInput(value) {
        this.setState({ searchTerm: value });
        
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        if (!value || value.length < 2) {
            this.setState({ 
                searchResults: [],
                error: null 
            });
            return;
        }
        
        this.searchTimeout = setTimeout(() => {
            this.searchStudents(value);
        }, 300);
    }

    /**
     * Toggle student selection
     * @param {Object} student - Student object to toggle
     */
    toggleStudent(student) {
        const selectedStudents = [...this.state.selectedStudents];
        const index = selectedStudents.findIndex(s => s._id === student._id);
        
        if (index === -1) {
            selectedStudents.push(student);
        } else {
            selectedStudents.splice(index, 1);
        }
        
        this.setState({ selectedStudents });
    }

    /**
     * Handle submission of selected students
     * @param {Event} e - Form submission event
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.state.selectedStudents.length === 0) {
            this.setState({ error: 'Please select at least one student' });
            return;
        }

        try {
            this.setState({ loading: true, error: null });
            
            const results = await Promise.all(
                this.state.selectedStudents.map(student =>
                    window.api.addStudentToClass(this.classId, student._id)
                        .catch(err => {
                            console.error(`Failed to add student ${student.username}:`, err);
                            return { error: err, student };
                        })
                )
            );

            const errors = results.filter(r => r.error);
            if (errors.length > 0) {
                const errorMessage = errors.map(e => 
                    `Failed to add ${e.student.username}: ${e.error.message}`
                ).join('\n');
                throw new Error(errorMessage);
            }

            this.onSubmit?.(this.state.selectedStudents);
            this.close();
        } catch (error) {
            console.error('Submit error:', error);
            this.setState({ 
                error: error.message || 'Failed to add students to class',
                loading: false 
            });
        }
    }

    /**
     * Update the user interface based on current state
     * Manages search results, selected students, error display, and loading state
     */
    updateUI() {
        if (!this.modal) return;

        const resultsContainer = this.modal?.querySelector('.search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
            
            if (this.state.loading) {
                resultsContainer.innerHTML = '<div class="loading">Searching...</div>';
            } else if (this.state.searchResults.length === 0) {
                resultsContainer.innerHTML = '<div class="no-results">No students found</div>';
            } else {
                this.state.searchResults.forEach(student => {
                    const isSelected = this.state.selectedStudents.some(s => s._id === student._id);
                    const studentElement = document.createElement('div');
                    studentElement.className = `student-item ${isSelected ? 'selected' : ''}`;
                    studentElement.innerHTML = `
                        <span>${student.username} (${student.email})</span>
                        <button class="btn btn-sm ${isSelected ? 'btn-secondary' : 'btn-primary'}">
                            ${isSelected ? 'Remove' : 'Add'}
                        </button>
                    `;
                    
                    studentElement.querySelector('button').addEventListener('click', () => {
                        this.toggleStudent(student);
                    });
                    
                    resultsContainer.appendChild(studentElement);
                });
            }
        }

        const selectedContainer = this.modal?.querySelector('.selected-students');
        if (selectedContainer) {
            selectedContainer.innerHTML = '';
            
            this.state.selectedStudents.forEach(student => {
                const studentElement = document.createElement('div');
                studentElement.className = 'selected-student';
                studentElement.innerHTML = `
                    <span>${student.username}</span>
                    <button class="btn btn-sm btn-secondary">Remove</button>
                `;
                
                studentElement.querySelector('button').addEventListener('click', () => {
                    this.toggleStudent(student);
                });
                
                selectedContainer.appendChild(studentElement);
            });
        }

        const errorElement = this.modal?.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = this.state.error ? 'block' : 'none';
            if (this.state.error) {
                errorElement.textContent = this.state.error;
            }
        }

        const submitButton = this.modal?.querySelector('.submit-btn');
        if (submitButton) {
            submitButton.disabled = this.state.loading;
            submitButton.textContent = this.state.loading ? 'Adding...' : 'Add Selected Students';
        }
    }

    /**
     * Close the modal and trigger onClose callback
     */
    close() {
        if (this.modal) {
            this.modal.remove();
            this.onClose?.();
        }
    }

    /**
     * Render the modal dialog with search and selection functionality
     * @returns {HTMLElement} Complete modal element
     */
    render() {
        this.modal = document.createElement('div');
        this.modal.className = 'modal';
        
        this.modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add Students to Class</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="form-group">
                            <input type="text" 
                                   class="form-control search-input" 
                                   placeholder="Search students by name or email..."
                            >
                        </div>
                        
                        <div class="error-message"></div>
                        
                        <div class="search-results">
                            <!-- Search results will be rendered here -->
                        </div>
                        
                        <div class="selected-students-container">
                            <h4>Selected Students</h4>
                            <div class="selected-students">
                                <!-- Selected students will be rendered here -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn btn-secondary cancel-btn">Cancel</button>
                        <button class="btn btn-primary submit-btn">Add Selected Students</button>
                    </div>
                </div>
            </div>
        `;

        this.modal.querySelector('.close-btn').addEventListener('click', () => this.close());
        this.modal.querySelector('.cancel-btn').addEventListener('click', () => this.close());
        this.modal.querySelector('.submit-btn').addEventListener('click', (e) => this.handleSubmit(e));
        
        const searchInput = this.modal.querySelector('.search-input');
        searchInput.addEventListener('input', (e) => this.handleSearchInput(e.target.value));

        this.updateUI();

        return this.modal;
    }
}