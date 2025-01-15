import BaseQuestionRenderer from './BaseQuestionRenderer.js';

export default class MultipleChoiceRenderer extends BaseQuestionRenderer {
  constructor(question, options = {}) {
    super(question, options);
    // Initialize selectedOption from initialAnswer if it exists
    this.selectedOption = options.initialAnswer?.selectedOption ?? null;
  }

  validate() {
    return this.selectedOption !== null;
  }

  getValue() {
    return {
      questionType: 'MultipleChoice',
      questionId: this.question._id,
      selectedOption: this.selectedOption,
      answer: this.selectedOption
    };
  }

  render() {
    const container = super.render();
    container.className += ' multiple-choice-question';

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';

    this.question.options.forEach((option, index) => {
      const optionContainer = document.createElement('div');
      optionContainer.className = `option-container ${this.selectedOption === index ? 'selected' : ''}`;

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `question-${this.question._id}`;
      radio.value = index;
      radio.id = `option-${this.question._id}-${index}`;
      radio.checked = this.selectedOption === index;

      const label = document.createElement('label');
      label.htmlFor = radio.id;
      label.textContent = option;

      // Handle selection
      const handleSelect = () => {
        this.selectedOption = index;
        // Update visual state
        optionsContainer.querySelectorAll('.option-container').forEach(container => {
          container.classList.remove('selected');
        });
        optionContainer.classList.add('selected');
        radio.checked = true;
        this.setState(this.getValue());
      };

      // Add click handlers
      optionContainer.addEventListener('click', handleSelect);
      radio.addEventListener('change', handleSelect);

      optionContainer.appendChild(radio);
      optionContainer.appendChild(label);
      optionsContainer.appendChild(optionContainer);
    });

    container.appendChild(optionsContainer);
    return container;
  }
}