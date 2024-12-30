import BaseGrader from './BaseGrader.js';

export default class WrittenGrader extends BaseGrader {
  renderAnswerDisplay() {
    const container = document.createElement('div');
    container.className = 'written-answer';

    // Word count display
    if (this.question.maxWords) {
      const wordCount = this.answer.answer.trim().split(/\s+/).length;
      const wordCountElement = document.createElement('div');
      wordCountElement.className = `word-count ${wordCount > this.question.maxWords ? 'exceeded' : ''}`;
      wordCountElement.textContent = `Word count: ${wordCount}/${this.question.maxWords}`;
      container.appendChild(wordCountElement);
    }

    // Answer text
    const answerText = document.createElement('div');
    answerText.className = 'answer-text';
    answerText.textContent = this.answer.answer;
    container.appendChild(answerText);

    // Rubric display if available
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

  renderGradingControls() {
    const container = super.renderGradingControls();

    // Add rubric-based scoring buttons if rubric is available
    if (this.question.rubric) {
      const quickScoreButtons = document.createElement('div');
      quickScoreButtons.className = 'quick-score-buttons';

      [0, 25, 50, 75, 100].forEach(score => {
        const button = document.createElement('button');
        button.className = 'btn btn-secondary btn-sm';
        button.textContent = `${score}%`;
        button.addEventListener('click', () => {
          this.setState({ score });
        });
        quickScoreButtons.appendChild(button);
      });

      container.insertBefore(quickScoreButtons, container.firstChild);
    }

    return container;
  }
}