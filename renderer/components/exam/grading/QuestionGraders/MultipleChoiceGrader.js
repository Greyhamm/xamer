import BaseGrader from './BaseGrader.js';

export default class MultipleChoiceGrader extends BaseGrader {
  constructor(options) {
    super(options);
    
    // Auto-grade if correct answer is available
    if (this.question.correctOption !== undefined) {
      const isCorrect = this.answer.selectedOption === this.question.correctOption;
      this.setState({
        score: isCorrect ? 100 : 0,
        feedback: isCorrect ? 'Correct answer!' : 'Incorrect answer.'
      });
    }
  }

  renderAnswerDisplay() {
    const container = document.createElement('div');
    container.className = 'multiple-choice-answer';

    // Display all options with selected one highlighted
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-display';

    this.question.options.forEach((option, index) => {
      const optionElement = document.createElement('div');
      optionElement.className = 'option-display';

      const isSelected = index === this.answer.selectedOption;
      const isCorrect = index === this.question.correctOption;

      optionElement.classList.add(
        isSelected ? 'selected' : '',
        isCorrect ? 'correct' : '',
        isSelected && !isCorrect ? 'incorrect' : ''
      );

      optionElement.innerHTML = `
        <span class="option-marker">${isSelected ? '✓' : ''}</span>
        <span class="option-text">${option}</span>
        ${isCorrect ? '<span class="correct-marker">✓</span>' : ''}
      `;

      optionsContainer.appendChild(optionElement);
    });

    container.appendChild(optionsContainer);
    return container;
  }
}