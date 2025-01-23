import DOMHelper from '../../services/utils/DOMHelper.js';  
import GradingView from './GradingView.js';

/**
 * SubmissionsView: A comprehensive component for displaying and managing exam submissions
 * 
 * This class provides a detailed view of student submissions, including:
 * - Fetching and displaying submission data
 * - Providing actions for grading or reviewing submissions
 * - Handling different submission states
 */
export default class SubmissionsView {
    /**
     * Initialize the submissions view
     * Sets up initial state for tracking submissions
     */
    constructor() {
        // Array to store submission data
        this.submissions = [];
        
        // Loading state to manage UI during data fetching
        this.loading = true;
    }

    /**
     * Fetch submissions data from the API
     * 
     * This method retrieves all submissions, handling potential errors
     * and logging for debugging purposes
     * 
     * @returns {Promise<void>} Resolves when submissions are fetched
     * @throws {Error} If there's an issue retrieving submissions
     */
    async fetchSubmissions() {
        try {
            // Attempt to retrieve submissions via API
            const submissions = await window.api.getSubmissions();
            
            // Log fetched submissions for debugging
            console.log('Fetched submissions:', submissions);
            
            // Store submissions in component state
            this.submissions = submissions;
        } catch (error) {
            // Log and handle any errors during fetching
            console.error('Error fetching submissions:', error);
            throw error;
        } finally {
            // Always set loading to false after attempt
            this.loading = false;
        }
    }

    /**
     * Determine appropriate action based on submission status
     * 
     * @param {Object} submission - The submission to be processed
     */
    handleSubmissionAction(submission) {
        // If submission is already graded, allow review
        if (submission.status === 'graded') {
            this.reviewSubmission(submission);
        } else {
            // Otherwise, proceed with grading
            this.gradeSubmission(submission);
        }
    }

    /**
     * Review a completed submission in read-only mode
     * 
     * @param {Object} submission - The submission to review
     */
    reviewSubmission(submission) {
        // Use GradingView in a read-only context
        const gradingView = new GradingView(submission);
        
        // Clear main content and render review
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '';
        mainContent.appendChild(gradingView.render());
    }
  
    /**
     * Open grading interface for an ungraded submission
     * 
     * @param {Object} submission - The submission to grade
     */
    gradeSubmission(submission) {
        // Create grading view for the submission
        const gradingView = new GradingView(submission);
        
        // Clear main content and render grading interface
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '';
        mainContent.appendChild(gradingView.render());
    }

    /**
     * Render the complete submissions view
     * Handles different states: loading, no data, and populated submissions
     * 
     * @returns {HTMLElement} Fully constructed submissions view container
     */
    render() {
        // Create container using DOMHelper for consistent element creation
        const container = DOMHelper.createElement('div', {
            classes: ['submissions-container']
        });

        // Create and append header
        const header = DOMHelper.createElement('div', {
            classes: ['submissions-header']
        });

        const title = DOMHelper.createElement('h2', {
            text: 'Exam Submissions',
            classes: ['submissions-title']
        });

        header.appendChild(title);
        container.appendChild(header);

        // Loading message while fetching submissions
        const loadingMsg = DOMHelper.createElement('p', {
            text: 'Loading submissions...',
            classes: ['loading-message']
        });
        container.appendChild(loadingMsg);

        // Fetch and render submissions
        this.fetchSubmissions().then(() => {
            // Remove loading message
            container.removeChild(loadingMsg);

            // Handle empty submissions scenario
            if (this.submissions.length === 0) {
                const noSubmissions = DOMHelper.createElement('p', {
                    text: 'No submissions found.',
                    classes: ['no-data-message']
                });
                container.appendChild(noSubmissions);
                return;
            }

            // Create submissions table
            const table = DOMHelper.createElement('table', {
                classes: ['data-table']
            });

            // Table headers
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

            // Table body with submissions
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
                    <td>
                        <span class="status-badge ${submission.status}">
                            ${submission.status}
                        </span>
                    </td>
                    <td>${submission.status === 'graded' ? `${submission.totalScore}%` : '-'}</td>
                `;

                const actionCell = DOMHelper.createElement('td');
                actionCell.appendChild(actionButton);
                row.appendChild(actionCell);

                tbody.appendChild(row);
            });

            table.appendChild(thead);
            table.appendChild(tbody);
            container.appendChild(table);
        }).catch(error => {
            container.innerHTML = `
                <p class="error-message">Error loading submissions: ${error.message}</p>
            `;
        });

        return container;
    }
}