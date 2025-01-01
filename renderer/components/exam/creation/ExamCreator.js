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

    this.container = null;
    this.questionsContainer = null;
    this.titleInput = null;
  }

  setState(newState) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...newState };
    
    // Only update what's necessary
    if (this.state.loading !== oldState.loading) {
      this.updateLoadingState();
    }
    if (this.state.error !== oldState.error) {
      this.updateErrorState();
    }
    // Don't re-render questions unless questions array itself changed
    if (this.state.questions !== oldState.questions) {
      this.renderQuestions();
    }
  }

  updateLoadingState() {
    if (this.saveButton) {
      this.saveButton.setDisabled(this.state.loading);
    }
    if (this.publishButton) {
      this.publishButton.setDisabled(this.state.loading);
    }
  }

  updateErrorState() {
    if (this.errorElement) {
      this.errorElement.style.display = this.state.error ? 'block' : 'none';
      if (this.state.error) {
        this.errorElement.textContent = this.state.error;
      }
    }
  }

  addQuestion(type) {
    const QuestionClass = this.questionTypes[type];
    if (!QuestionClass) {
      console.error(`Unknown question type: ${type}`);
      return;
    }
  
    const question = new QuestionClass({
      onDelete: () => this.removeQuestion(question),
      onChange: () => {
        // Don't trigger full re-render, just update internal state
        const questionIndex = this.state.questions.indexOf(question);
        if (questionIndex !== -1) {
          this.state.questions[questionIndex] = question;
        }
      },
      type: type
    });
  
    // Update questions array without triggering full re-render
    this.state.questions.push(question);
    
    // Only render the new question
    this.appendQuestionToContainer(question, this.state.questions.length - 1);
  }

  removeQuestion(question) {
    const index = this.state.questions.indexOf(question);
    if (index !== -1) {
      // Remove the question's DOM element
      const questionWrapper = this.questionsContainer.children[index];
      if (questionWrapper) {
        question.dispose(); // Clean up the question (especially important for coding editors)
        questionWrapper.remove();
      }
      
      // Update state without triggering re-render
      this.state.questions.splice(index, 1);
      
      // Update remaining question numbers
      this.updateQuestionNumbers();
    }
  }

  updateQuestionNumbers() {
    Array.from(this.questionsContainer.children).forEach((wrapper, index) => {
      const numberLabel = wrapper.querySelector('.question-number');
      if (numberLabel) {
        numberLabel.textContent = `Question ${index + 1}`;
      }
    });
  }

  appendQuestionToContainer(question, index) {
    if (!this.questionsContainer) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'question-wrapper';
    
    const numberLabel = document.createElement('div');
    numberLabel.className = 'question-number';
    numberLabel.textContent = `Question ${index + 1}`;
    
    wrapper.appendChild(numberLabel);
    wrapper.appendChild(question.render());
    this.questionsContainer.appendChild(wrapper);
  }

  async saveExam(publish = false) {
    try {
      this.setState({ loading: true, error: null });
  
      const examData = {
        title: this.state.title,
        questions: this.state.questions.map(q => q.getQuestionData()),
        status: publish ? 'published' : 'draft'
      };
  
      const errors = ValidationService.validateExam(examData);
      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }
  
      const savedExam = await ExamState.saveExam(examData);
  
      if (publish && savedExam) {
        await ExamState.publishExam(savedExam._id);
      }
  
      // Clear form without re-rendering
      this.clearForm();
  
      alert(`Exam ${publish ? 'published' : 'saved'} successfully!`);
    } catch (error) {
      console.error('Error saving exam:', error);
      this.setState({
        loading: false,
        error: error.message
      });
    }
  }

  clearForm() {
    // Clean up existing questions
    this.state.questions.forEach(question => question.dispose());
    
    // Reset state
    this.state = {
      title: '',
      questions: [],
      loading: false,
      error: null
    };

    // Update UI without full re-render
    if (this.titleInput) {
      this.titleInput.setValue('');
    }
    if (this.questionsContainer) {
      this.questionsContainer.innerHTML = '';
    }
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'exam-creator-container';

    // Header
    const header = document.createElement('h2');
    header.className = 'exam-creator-header';
    header.textContent = 'Create New Exam';

    // Error message
    this.errorElement = document.createElement('div');
    this.errorElement.className = 'error-message';
    this.errorElement.style.display = 'none';

    // Title input
    this.titleInput = new Input({
      placeholder: 'Enter exam title...',
      value: this.state.title,
      onChange: (value) => {
        this.state.title = value; // Update state without re-render
      }
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
    this.container.appendChild(header);
    this.container.appendChild(this.errorElement);
    this.container.appendChild(this.titleInput.render());
    this.container.appendChild(buttonGroup);
    this.container.appendChild(this.questionsContainer);
    this.container.appendChild(saveButtonsContainer);

    return this.container;
  }
}