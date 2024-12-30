export default class BaseGrader {
    constructor(options) {
      this.question = options.question;
      this.answer = options.answer;
      this.onGradeChange = options.onGradeChange;
      this.state = {
        score: null,
        feedback: ''
      };
    }
  
    setState(newState) {
      this.state = { ...this.state, ...newState };
      if (this.onGradeChange) {
        this.onGradeChange(this.state);
      }
    }
  
    renderAnswerDisplay() {
      return document.createElement('div');
    }
  
    renderGradingControls() {
      const container = document.createElement('div');
      container.className = 'grading-controls';
  
      // Score input
      const scoreGroup = document.createElement('div');
      scoreGroup.className = 'form-group';
      scoreGroup.innerHTML = `
        <label>Score</label>
        <input type="number" min="0" max="100" class="score-input" />
      `;
  
      const scoreInput = scoreGroup.querySelector('input');
      scoreInput.value = this.state.score || '';
      scoreInput.addEventListener('input', (e) => {
        this.setState({ score: parseInt(e.target.value, 10) || 0 });
      });
  
      // Feedback input
      const feedbackGroup = document.createElement('div');
      feedbackGroup.className = 'form-group';
      feedbackGroup.innerHTML = `
        <label>Feedback</label>
        <textarea class="feedback-input" rows="3"></textarea>
      `;
  
      const feedbackInput = feedbackGroup.querySelector('textarea');
      feedbackInput.value = this.state.feedback;
      feedbackInput.addEventListener('input', (e) => {
        this.setState({ feedback: e.target.value });
      });
  
      container.appendChild(scoreGroup);
      container.appendChild(feedbackGroup);
      return container;
    }
  
    render() {
      const container = document.createElement('div');
      container.className = 'grader-container';
      container.appendChild(this.renderAnswerDisplay());
      container.appendChild(this.renderGradingControls());
      return container;
    }
  }