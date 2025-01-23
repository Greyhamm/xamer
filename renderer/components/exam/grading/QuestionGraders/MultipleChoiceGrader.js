// renderer/components/exam/grading/QuestionGraders/MultipleChoiceGrader.js
import BaseGrader from './BaseGrader.js';

/**
 * MultipleChoiceGrader: A specialized grading component for multiple-choice question submissions
 * 
 * This class provides a comprehensive interface for evaluating multiple-choice answers, including:
 * - Visual representation of student's selected answer
 * - Highlighting of correct answer
 * - Automatic initial grading based on correctness
 * - Flexible feedback mechanism
 */
export default class MultipleChoiceGrader extends BaseGrader {
    /**
     * Constructor for MultipleChoiceGrader
     * 
     * Automatically grades the answer if a correct option is available
     * 
     * @param {Object} options - Configuration options for the grader
     */
    constructor(options) {
        // Invoke parent constructor
        super(options);

        // Automatic grading when correct answer is known
        if (this.answer && this.question.correctOption !== undefined) {
            const isCorrect = this.answer.answer === this.question.correctOption;
            
            // Set initial state based on answer correctness
            this.setState({
                score: isCorrect ? this.question.points : 0,
                feedback: isCorrect ? 'Correct answer' : 'Incorrect answer'
            });
        }
    }

    /**
     * Render the multiple-choice answer section
     * 
     * Provides a visual breakdown of:
     * - Student's selected answer
     * - Correct answer
     * - Visual indicators for selection and correctness
     * 
     * @returns {HTMLElement} Container with detailed answer display
     */
    renderAnswer() {
        const container = document.createElement('div');
        container.className = 'multiple-choice-answer';

        // Render each option with visual indicators
        this.question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            
            // Apply CSS classes to show selection and correctness
            optionElement.className = `option-display ${
                index === this.answer.answer ? 'selected' : ''
            } ${index === this.question.correctOption ? 'correct' : ''}`;

            // Create option display with selection and correctness markers
            optionElement.innerHTML = `
                <span class="option-marker">${index === this.answer.answer ? '✓' : ''}</span>
                <span class="option-text">${option}</span>
                ${index === this.question.correctOption ? '<span class="correct-marker">✓</span>' : ''}
            `;

            container.appendChild(optionElement);
        });

        return container;
    }
}