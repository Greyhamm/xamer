// renderer/components/exam/grading/QuestionGraders/MultipleChoiceGrader.js
import BaseGrader from './BaseGrader.js';

export default class MultipleChoiceGrader extends BaseGrader {
    constructor(options) {
        super(options);
        // Auto-grade if correct answer is available
        if (this.answer && this.question.correctOption !== undefined) {
            const isCorrect = this.answer.answer === this.question.correctOption;
            this.setState({
                score: isCorrect ? 100 : 0,
                feedback: isCorrect ? 'Correct answer' : 'Incorrect answer'
            });
        }
    }

    renderAnswer() {
        const container = document.createElement('div');
        container.className = 'multiple-choice-answer';

        this.question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = `option-display ${
                index === this.answer.answer ? 'selected' : ''
            } ${index === this.question.correctOption ? 'correct' : ''}`;

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