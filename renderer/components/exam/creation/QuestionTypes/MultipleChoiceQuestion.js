import BaseQuestion from './BaseQuestion.js';
import Input from '../../../common/Input.js';
import Button from '../../../common/Button.js';

export default class MultipleChoiceQuestion extends BaseQuestion {
  constructor(options = {}) {
    super(options);
    this.type = 'MultipleChoice';
    this.state = {
      ...this.state,
      options: options.options || ['', '', '', ''],
      correctOption: options.correctOption || null
    };
  }

  getQuestionData() {
    return {
      ...super.getQuestionData(),
      options: this.state.options,
      correctOption: this.state.correctOption
    };
  }

  validate() {
    const errors = super.validate();
    
    this.state.options.forEach((option, index) => {
      if (!option.trim()) {
        errors.push(`Option ${index + 1} cannot be empty`);
      }
    });

    if (this.state.correctOption === null) {
      errors.push('Please select a correct option');
    }

    return errors;
  }

  render() {
    const container = super.createQuestionContainer();

    // Options container
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';

    // Render options
    this.state.options.forEach((option, index) => {
      const optionGroup = document.createElement('div');
      optionGroup.className = 'option-group';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `correct-option-${this.id}`;
      radio.value = index;
      radio.checked = this.state.correctOption === index;
      radio.addEventListener('change', () => {
        this.setState({ correctOption: index });
      });

      const optionInput = new Input({
        value: option,
        placeholder: `Option ${index + 1}`,
        onChange: (value) => {
          const newOptions = [...this.state.options];
          newOptions[index] = value;
          this.setState({ options: newOptions });
        }
      });

      optionGroup.appendChild(radio);
      optionGroup.appendChild(optionInput.render());
      optionsContainer.appendChild(optionGroup);
    });

    container.appendChild(optionsContainer);
    return container;
  }
}