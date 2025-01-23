/**
 * BaseGrader: An abstract base class for question grading components
 * 
 * This class provides a standardized interface and common functionality 
 * for grading different types of questions. It serves as a template 
 * for specific question type graders, establishing a consistent 
 * approach to grading across various question formats.
 * 
 * Key Responsibilities:
 * - Manage basic grading state
 * - Provide a standard interface for grading components
 * - Handle score and feedback tracking
 * - Generate common grading UI elements
 */
export default class BaseGrader {
    /**
     * Constructor for BaseGrader
     * 
     * Initializes the foundational state and tracking for question grading
     * 
     * @param {Object} options - Configuration options for the grader
     * @param {Object} options.question - The question being graded
     * @param {Object} options.answer - The student's submitted answer
     * @param {Function} options.onGradeChange - Callback for grade updates
     */
    constructor(options) {
        // Store the question and answer details
        this.question = options.question;
        this.answer = options.answer;

        // Callback to notify parent component of grade changes
        this.onGradeChange = options.onGradeChange;

        // Initialize grading state
        this.state = {
            // Track score for the question
            score: this.answer.score || null,
            
            // Store feedback for the student's answer
            feedback: this.answer.feedback || ''
        };
    }

    /**
     * Update the grading state and trigger change notification
     * 
     * @param {Object} newState - New state to merge with existing state
     */
    setState(newState) {
        // Merge new state with existing state
        this.state = { ...this.state, ...newState };

        // Notify parent component of grade changes
        if (this.onGradeChange) {
            // Only send score and feedback to parent
            const { score, feedback } = this.state;
            this.onGradeChange({ score, feedback });
        }

        // Update UI to reflect state changes
        this.updateUI();
    }

    /**
     * Create standard grading controls for all question types
     * 
     * Generates a UI section with:
     * - Score input
     * - Feedback textarea
     * 
     * @returns {HTMLElement} Container with grading control elements
     */
    createGradingControls() {
        const container = document.createElement('div');
        container.className = 'grading-controls';

        // Create score input section
        const scoreContainer = document.createElement('div');
        scoreContainer.className = 'score-input-container';
        
        // Determine maximum points for the question
        const maxPoints = this.question.points;
        
        scoreContainer.innerHTML = `
            <label>Score (0-${maxPoints} points):</label>
            <input type="number" 
                   min="0" 
                   max="${maxPoints}" 
                   class="score-input" 
                   value="${this.state.score || ''}">
        `;
    
        const scoreInput = scoreContainer.querySelector('input');
        
        // Add event listener to update score
        scoreInput.addEventListener('input', (e) => {
            // Ensure score is within valid range
            const score = Math.min(parseInt(e.target.value) || 0, maxPoints);
            this.setState({ score });
        });

        // Create feedback input section
        const feedbackContainer = document.createElement('div');
        feedbackContainer.className = 'feedback-input-container';
        feedbackContainer.innerHTML = `
            <label>Feedback:</label>
            <textarea class="feedback-input" rows="3">${this.state.feedback || ''}</textarea>
        `;

        // Add event listener to update feedback
        const feedbackInput = feedbackContainer.querySelector('textarea');
        feedbackInput.addEventListener('input', (e) => {
            this.setState({ feedback: e.target.value });
        });

        // Compose final grading controls
        container.appendChild(scoreContainer);
        container.appendChild(feedbackContainer);
        
        return container;
    }

    /**
     * Render the base grading interface
     * 
     * Provides a standard layout for grading components:
     * - Question display
     * - Answer display (to be implemented by child classes)
     * - Grading controls
     * 
     * @returns {HTMLElement} Complete grading component container
     */
    render() {
        const container = document.createElement('div');
        container.className = 'grader-container';

        // Create question display area
        const questionDisplay = document.createElement('div');
        questionDisplay.className = 'question-display';
        container.appendChild(questionDisplay);

        // Render answer (to be implemented by specific graders)
        container.appendChild(this.renderAnswer());

        // Add standard grading controls
        container.appendChild(this.createGradingControls());

        return container;
    }

    /**
     * Placeholder method for rendering answer
     * Must be overridden by specific grader implementations
     * 
     * @returns {HTMLElement} Default empty container
     */
    renderAnswer() {
        return document.createElement('div');
    }

    /**
     * Placeholder method for updating UI
     * Can be overridden by specific grader implementations
     */
    updateUI() {
        // Default implementation does nothing
    }

    /**
     * Clean up resources and remove event listeners
     * Provides a standard disposal method for grading components
     */
    dispose() {
        // Reset reference to change callback
        this.onGradeChange = null;
    }
}