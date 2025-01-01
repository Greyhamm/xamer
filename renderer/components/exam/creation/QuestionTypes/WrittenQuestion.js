import BaseQuestion from './BaseQuestion.js';
import Input from '../../../common/Input.js';

export default class WrittenQuestion extends BaseQuestion {
  constructor(options = {}) {
    super(options);
    this.type = 'Written';
    this.state = {
      ...this.state,
      maxWords: options.maxWords || null,
      rubric: options.rubric || ''
    };
  }

  getQuestionData() {
    return {
      type: this.type, // Ensure type is set
      prompt: this.state.prompt,
      maxWords: this.state.maxWords,
      rubric: this.state.rubric
    };
  }

  render() {
    const container = super.createQuestionContainer();

    // Max words input
    const maxWordsGroup = document.createElement('div');
    maxWordsGroup.className = 'form-group';
    
    const maxWordsLabel = document.createElement('label');
    maxWordsLabel.textContent = 'Maximum Words (optional)';
    
    const maxWordsInput = new Input({
      type: 'number',
      value: this.state.maxWords || '',
      placeholder: 'Enter maximum words limit',
      onChange: (value) => this.setState({ maxWords: value ? parseInt(value) : null })
    });

    maxWordsGroup.appendChild(maxWordsLabel);
    maxWordsGroup.appendChild(maxWordsInput.render());

    // Rubric input
    const rubricGroup = document.createElement('div');
    rubricGroup.className = 'form-group';
    
    const rubricLabel = document.createElement('label');
    rubricLabel.textContent = 'Grading Rubric';
    
    const rubricInput = new Input({
      multiline: true,
      value: this.state.rubric,
      placeholder: 'Enter grading criteria and point distribution...',
      onChange: (value) => this.setState({ rubric: value })
    });

    rubricGroup.appendChild(rubricLabel);
    rubricGroup.appendChild(rubricInput.render());

    container.appendChild(maxWordsGroup);
    container.appendChild(rubricGroup);

    return container;
  }
}