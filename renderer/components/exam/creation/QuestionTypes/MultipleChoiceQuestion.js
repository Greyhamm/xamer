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
    this.inputs = new Map();
  }

  getQuestionData() {
    return {
      ...super.getQuestionData(), // Include base question data with points
      type: this.type,
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
    const container = super.render();
    container.className += ' multiple-choice-question';
  
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

      const inputContainer = document.createElement('div');
      inputContainer.className = 'input-container';
      inputContainer.style.flex = '1';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-control';
      input.value = option;
      input.placeholder = `Option ${index + 1}`;
      
      // Use input event instead of onChange
      input.addEventListener('input', (e) => {
        const newOptions = [...this.state.options];
        newOptions[index] = e.target.value;
        this.setState({ options: newOptions });
      });

      // Store reference to input
      this.inputs.set(index, input);

      inputContainer.appendChild(input);
      optionGroup.appendChild(radio);
      optionGroup.appendChild(inputContainer);
      optionsContainer.appendChild(optionGroup);
    });

    // Add/Remove options buttons
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    const addButton = new Button({
      text: 'Add Option',
      className: 'btn-secondary',
      onClick: () => {
        const newOptions = [...this.state.options, ''];
        this.setState({ options: newOptions });
      }
    });

    const removeButton = new Button({
      text: 'Remove Option',
      className: 'btn-secondary',
      onClick: () => {
        if (this.state.options.length > 2) {
          const newOptions = this.state.options.slice(0, -1);
          this.setState({ options: newOptions });
        }
      }
    });

    buttonGroup.appendChild(addButton.render());
    buttonGroup.appendChild(removeButton.render());

    container.appendChild(optionsContainer);
    container.appendChild(buttonGroup);

    return container;
  }

  dispose() {
    // Call parent dispose
    super.dispose();
    // Clean up MultipleChoiceQuestion specific resources
    if (this.inputs) {
      this.inputs.clear();
      this.inputs = null;
    }
    this.state = null;
  }
}