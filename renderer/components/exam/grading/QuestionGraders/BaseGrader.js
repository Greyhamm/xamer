// renderer/components/exam/grading/QuestionGraders/BaseGrader.js
export default class BaseGrader {
  constructor(options) {
      this.question = options.question;
      this.answer = options.answer;
      this.onGradeChange = options.onGradeChange;
      this.state = {
          score: this.answer.score || null,
          feedback: this.answer.feedback || ''
      };
  }

  setState(newState) {
      this.state = { ...this.state, ...newState };
      if (this.onGradeChange) {
          // Only send score and feedback to parent
          const { score, feedback } = this.state;
          this.onGradeChange({ score, feedback });
      }
      this.updateUI();
  }

  updateUI() {
      // To be implemented by specific graders
  }

  createGradingControls() {
      const container = document.createElement('div');
      container.className = 'grading-controls';

      // Score input
      const scoreContainer = document.createElement('div');
      scoreContainer.className = 'score-input-container';
      scoreContainer.innerHTML = `
          <label>Score (0-100):</label>
          <input type="number" min="0" max="100" class="score-input" value="${this.state.score || ''}">
      `;

      const scoreInput = scoreContainer.querySelector('input');
      scoreInput.addEventListener('input', (e) => {
          const score = parseInt(e.target.value) || null;
          this.setState({ score });
      });

      // Feedback input
      const feedbackContainer = document.createElement('div');
      feedbackContainer.className = 'feedback-input-container';
      feedbackContainer.innerHTML = `
          <label>Feedback:</label>
          <textarea class="feedback-input" rows="3">${this.state.feedback || ''}</textarea>
      `;

      const feedbackInput = feedbackContainer.querySelector('textarea');
      feedbackInput.addEventListener('input', (e) => {
          this.setState({ feedback: e.target.value });
      });

      container.appendChild(scoreContainer);
      container.appendChild(feedbackContainer);
      return container;
  }

  render() {
      const container = document.createElement('div');
      container.className = 'grader-container';

      // Question display
      const questionDisplay = document.createElement('div');
      questionDisplay.className = 'question-display';
      container.appendChild(questionDisplay);

      // Answer display - to be implemented by specific graders
      container.appendChild(this.renderAnswer());

      // Grading controls
      container.appendChild(this.createGradingControls());

      return container;
  }

  renderAnswer() {
      // To be implemented by specific graders
      return document.createElement('div');
  }

  dispose() {
      // Clean up any resources
      this.onGradeChange = null;
  }
}