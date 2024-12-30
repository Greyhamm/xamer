import BaseQuestionRenderer from './BaseQuestionRenderer.js';

export default class MultipleChoiceRenderer extends BaseQuestionRenderer {
  constructor(question, options = {}) {
    super(question, options);
    this.selectedOption = options.initialAnswer?.selectedOption ?? null;
  }

  validate() {
    return this.selectedOption !== null;
  }

  getValue() {
    return {
      questionType: 'MultipleChoice',
      selectedOption: this.selectedOption,
      answer: this.question.options[this.selectedOption]
    };
  }

  render() {
    const container = super.render();
    container.className += ' multiple-choice-question';

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';

    this.question.options.forEach((option, index) => {
      const optionContainer = document.createElement('div');
      optionContainer.className = 'option-container';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = `question-${this.question._id}`;
      radio.value = index;
      radio.id = `option-${this.question._id}-${index}`;
      radio.checked = this.selectedOption === index;

      radio.addEventListener('change', () => {
        this.selectedOption = index;
        this.setState(this.getValue());
      });

      const label = document.createElement('label');
      label.htmlFor = radio.id;
      label.textContent = option;

      optionContainer.appendChild(radio);
      optionContainer.appendChild(label);
      optionsContainer.appendChild(optionContainer);
    });

    container.appendChild(optionsContainer);
    return container;
  }
}