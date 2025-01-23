// renderer/components/exam/grading/QuestionGraders/WrittenGrader.js
import BaseGrader from './BaseGrader.js';

/**
 * WrittenGrader: A specialized grading component for written response questions
 * 
 * This class provides a comprehensive interface for evaluating written answers, including:
 * - Detailed answer display
 * - Word count verification
 * - Rubric-based grading
 * - Flexible feedback mechanisms
 */
export default class WrittenGrader extends BaseGrader {
    /**
     * Render the written answer section with comprehensive details
     * 
     * @returns {HTMLElement} Container with answer details and grading interface
     */
    renderAnswer() {
        const container = document.createElement('div');
        container.className = 'written-answer';

        // Word count tracking and validation
        if (this.question.maxWords) {
            const wordCount = this.answer.answer.trim().split(/\s+/).length;
            const wordCountElement = document.createElement('div');
            
            // Color-code word count based on compliance with max words
            wordCountElement.className = `word-count ${wordCount > this.question.maxWords ? 'exceeded' : ''}`;
            wordCountElement.textContent = `Word count: ${wordCount}/${this.question.maxWords}`;
            container.appendChild(wordCountElement);
        }

        // Display full student answer
        const answerText = document.createElement('div');
        answerText.className = 'answer-text';
        answerText.textContent = this.answer.answer;
        container.appendChild(answerText);

        // Display grading rubric if available
        if (this.question.rubric) {
            const rubricContainer = document.createElement('div');
            rubricContainer.className = 'rubric-container';
            rubricContainer.innerHTML = `
                <h4>Grading Rubric</h4>
                <pre class="rubric-text">${this.question.rubric}</pre>
            `;
            container.appendChild(rubricContainer);
        }

        return container;
    }
}