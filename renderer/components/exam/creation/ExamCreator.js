import Button from '../../common/Button.js';
import Input from '../../common/Input.js';
import MultipleChoiceQuestion from './QuestionTypes/MultipleChoiceQuestion.js';
import WrittenQuestion from './QuestionTypes/WrittenQuestion.js';
import CodingQuestion from './QuestionTypes/CodingQuestion.js';
import ExamState from '../../../services/state/ExamState.js';
import ValidationService from '../../../services/utils/validation.js';

export default class ExamCreator {
  constructor() {
    this.state = {
      title: '',
      questions: [],
      loading: false,
      error: null
    };

    this.questionTypes = {
      MultipleChoice: MultipleChoiceQuestion,
      Written: WrittenQuestion,
      Coding: CodingQuestion
    };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.updateUI();
  }

  updateUI() {
    if (this.errorElement) {
      this.errorElement.style.display = this.state.error ? 'block' : 'none';
      if (this.state.error) {
        this.errorElement.textContent = this.state.error;
      }
    }

    if (this.saveButton) {
      this.saveButton.setDisabled(this.state.loading);
    }

    if (this.publishButton) {
      this.publishButton.setDisabled(this.state.loading);
    }

    this.renderQuestions();
  }

  addQuestion(type) {
    const QuestionClass = this.questionTypes[type];
    if (!QuestionClass) {
      console.error(`Unknown question type: ${type}`);
      return;
    }

    const question = new QuestionClass({
      onDelete: () => this.removeQuestion(question),
      onChange: () => this.updateUI()
    });

    this.state.questions.push(question);
    this.updateUI();
  }

  removeQuestion(question) {
    const index = this.state.questions.indexOf(question);
    if (index !== -1) {
      this.state.questions.splice(index, 1);
      this.updateUI();
    }
  }

  async saveExam(publish = false) {
    try {
      this.setState({ loading: true, error: null });

      const examData = {
        title: this.state.title,
        questions: this.state.questions.map(q => q.getQuestionData()),
        status: publish ? 'published' : 'draft'
      };

      // Validate exam data
      const errors = ValidationService.validateExam(examData);
      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }

      const response = await ExamState.saveExam(examData);
      
      if (publish) {
        await ExamState.publishExam(response._id);
      }

      // Clear form
      this.setState({
        title: '',
        questions: [],
        loading: false
      });

      alert(`Exam ${publish ? 'published' : 'saved'} successfully!`);
    } catch (error) {
      this.setState({
        loading: false,
        error: error.message
      });
    }
  }

  render() {
    const container = document.createElement('div');
    container.className = 'exam-creator-container';

    // Header
    const header = document.createElement('h2');
    header.className = 'exam-creator-header';
    header.textContent = 'Create New Exam';

    // Error message
    this.errorElement = document.createElement('div');
    this.errorElement.className = 'error-message';
    this.errorElement.style.display = 'none';

    // Title input
    const titleInput = new Input({
      placeholder: 'Enter exam title...',
      value: this.state.title,
      onChange: (value) => this.setState({ title: value })
    });

    // Add question buttons
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    Object.keys(this.questionTypes).forEach(type => {
      const button = new Button({
        text: `Add ${type} Question`,
        className: 'btn-add',
        onClick: () => this.addQuestion(type)
      });
      buttonGroup.appendChild(button.render());
    });

    // Questions container
    this.questionsContainer = document.createElement('div');
    this.questionsContainer.className = 'questions-container';

    // Save buttons
    const saveButtonsContainer = document.createElement('div');
    saveButtonsContainer.className = 'save-buttons-container';

    this.saveButton = new Button({
      text: 'Save as Draft',
      className: 'btn-secondary',
      onClick: () => this.saveExam(false)
    });

    this.publishButton = new Button({
      text: 'Save & Publish',
      className: 'btn-primary',
      onClick: () => this.saveExam(true)
    });

    saveButtonsContainer.appendChild(this.saveButton.render());
    saveButtonsContainer.appendChild(this.publishButton.render());

    // Assemble container
    container.appendChild(header);
    container.appendChild(this.errorElement);
    container.appendChild(titleInput.render());
    container.appendChild(buttonGroup);
    container.appendChild(this.questionsContainer);
    container.appendChild(saveButtonsContainer);

    return container;
  }

  renderQuestions() {
    if (!this.questionsContainer) return;

    this.questionsContainer.innerHTML = '';
    this.state.questions.forEach((question, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'question-wrapper';
      
      const numberLabel = document.createElement('div');
      numberLabel.className = 'question-number';
      numberLabel.textContent = `Question ${index + 1}`;
      
      wrapper.appendChild(numberLabel);
      wrapper.appendChild(question.render());
      this.questionsContainer.appendChild(wrapper);
    });
  }
}