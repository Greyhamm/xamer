export default class AddStudentsModal {
    constructor(options = {}) {
        this.onClose = options.onClose;
        this.onSubmit = options.onSubmit;
        this.classId = options.classId;
        
        this.state = {
            searchTerm: '',
            searchResults: [],
            selectedStudents: [],
            loading: false,
            error: null
        };

        this.searchTimeout = null;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.updateUI();
    }

    async searchStudents(term) {
        // Clear results if search term is too short
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
                data: { query: term }  // Pass search term in request body
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
            // Only show error if it's not the minimum characters message
            if (!error.message.includes('2 characters')) {
                this.setState({ error: error.message });
            }
        } finally {
            this.setState({ loading: false });
        }
    }

    handleSearchInput(value) {
        this.setState({ searchTerm: value });
        
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Don't search immediately if less than 2 characters
        if (!value || value.length < 2) {
            this.setState({ 
                searchResults: [],
                error: null 
            });
            return;
        }
        
        // Debounce search with 300ms delay
        this.searchTimeout = setTimeout(() => {
            this.searchStudents(value);
        }, 300);
    }

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

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.state.selectedStudents.length === 0) {
            this.setState({ error: 'Please select at least one student' });
            return;
        }

        try {
            this.setState({ loading: true, error: null });
            
            // Add each selected student to the class
            await Promise.all(
                this.state.selectedStudents.map(student =>
                    window.api.addStudentToClass(this.classId, student._id)
                )
            );

            this.onSubmit?.(this.state.selectedStudents);
            this.close();
        } catch (error) {
            this.setState({ error: 'Failed to add students to class' });
        } finally {
            this.setState({ loading: false });
        }
    }

    updateUI() {
        // Update search results
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

        // Update selected students
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

        // Update error message
        const errorElement = this.modal?.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = this.state.error ? 'block' : 'none';
            if (this.state.error) {
                errorElement.textContent = this.state.error;
            }
        }

        // Update loading state
        const submitButton = this.modal?.querySelector('.submit-btn');
        if (submitButton) {
            submitButton.disabled = this.state.loading;
            submitButton.textContent = this.state.loading ? 'Adding...' : 'Add Selected Students';
        }
    }

    close() {
        if (this.modal) {
            this.modal.remove();
            this.onClose?.();
        }
    }

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

        // Add event listeners
        this.modal.querySelector('.close-btn').addEventListener('click', () => this.close());
        this.modal.querySelector('.cancel-btn').addEventListener('click', () => this.close());
        this.modal.querySelector('.submit-btn').addEventListener('click', (e) => this.handleSubmit(e));
        
        const searchInput = this.modal.querySelector('.search-input');
        searchInput.addEventListener('input', (e) => this.handleSearchInput(e.target.value));

        // Initial UI update
        this.updateUI();

        return this.modal;
    }
}