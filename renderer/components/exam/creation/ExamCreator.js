import Button from '../../common/Button.js';
import Input from '../../common/Input.js';
import MultipleChoiceQuestion from './QuestionTypes/MultipleChoiceQuestion.js';
import WrittenQuestion from './QuestionTypes/WrittenQuestion.js';
import CodingQuestion from './QuestionTypes/CodingQuestion.js';
import ExamState from '../../../services/state/ExamState.js';
import AppState from '../../../services/state/AppState.js';
import ValidationService from '../../../services/utils/validation.js';

export default class ExamCreator {
  constructor(options = {}) {
    console.log('ExamCreator initialized with options:', options);
    
    this.state = {
      title: '',
      questions: [],
      classId: options.classId,
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

    // Bind methods
    this.addQuestion = this.addQuestion.bind(this);
    this.removeQuestion = this.removeQuestion.bind(this);
    this.saveExam = this.saveExam.bind(this);
    this.updateUI = this.updateUI.bind(this);

    // Load class details if we have a classId
    if (this.state.classId) {
      this.loadClassDetails();
    }
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.updateUI();
  }

  async loadClassDetails() {
    try {
      console.log('Loading class details for:', this.state.classId);
      const response = await window.api.getClass({
        classId: this.state.classId
      });

      if (response.success) {
        this.setState({ classDetails: response.data });
      }
    } catch (error) {
      console.error('Failed to load class details:', error);
      this.setState({ error: 'Failed to load class details' });
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
        const questionIndex = this.state.questions.indexOf(question);
        if (questionIndex !== -1) {
          this.state.questions[questionIndex] = question;
        }
      },
      type: type
    });
  
    this.state.questions.push(question);
    this.appendQuestionToContainer(question, this.state.questions.length - 1);
  }

  removeQuestion(question) {
    const index = this.state.questions.indexOf(question);
    if (index !== -1) {
      const questionWrapper = this.questionsContainer.children[index];
      if (questionWrapper) {
        question.dispose();
        questionWrapper.remove();
      }
      this.state.questions.splice(index, 1);
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
            status: publish ? 'published' : 'draft',
            classId: this.state.classId  // Ensure classId is included
        };

        console.log('Preparing to save exam with data:', {
            title: examData.title,
            questionCount: examData.questions.length,
            classId: examData.classId,
            status: examData.status
        });

        const errors = ValidationService.validateExam(examData);
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }

        const savedExam = await ExamState.saveExam(examData);
        console.log('Exam saved successfully:', {
            id: savedExam._id,
            title: savedExam.title,
            classId: savedExam.class?._id,
            status: savedExam.status
        });

        if (publish && savedExam) {
            const publishedExam = await ExamState.publishExam(savedExam._id);
            console.log('Exam published successfully:', {
                id: publishedExam._id,
                title: publishedExam.title,
                classId: publishedExam.class?._id,
                status: publishedExam.status
            });
        }

        this.clearForm();
        alert(`Exam ${publish ? 'published' : 'saved'} successfully!`);

        // Navigate based on context
        if (this.state.classId) {
            console.log('Navigating back to class view:', this.state.classId);
            AppState.navigateTo('classView', { classId: this.state.classId });
        } else {
            AppState.navigateTo('teacherDashboard');
        }
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
    this.setState({
      title: '',
      questions: [],
      loading: false,
      error: null
    });

    // Clear UI
    if (this.titleInput) {
      this.titleInput.setValue('');
    }
    if (this.questionsContainer) {
      this.questionsContainer.innerHTML = '';
    }
  }

  updateUI() {
    if (!this.container) return;

    // Update class context if available
    const classContext = this.container.querySelector('.class-context-info');
    if (classContext && this.state.classDetails) {
      classContext.textContent = `Creating exam for: ${this.state.classDetails.name}`;
    }

    // Update error message
    const errorElement = this.container.querySelector('.error-message');
    if (errorElement) {
      errorElement.style.display = this.state.error ? 'block' : 'none';
      if (this.state.error) {
        errorElement.textContent = this.state.error;
      }
    }

    // Update loading state
    const buttons = this.container.querySelectorAll('button');
    buttons.forEach(button => {
      button.disabled = this.state.loading;
    });
  }

  render() {
    console.log('Rendering ExamCreator with state:', this.state);
    
    this.container = document.createElement('div');
    this.container.className = 'exam-creator-container';

    // Add class context if available
    if (this.state.classId) {
      const classContext = document.createElement('div');
      classContext.className = 'class-context';
      classContext.innerHTML = `
        <h3 class="exam-creator-header">Create New Exam</h3>
        <p class="class-context-info">
          ${this.state.classDetails ? 
            `Creating exam for: ${this.state.classDetails.name}` : 
            'Loading class details...'}
        </p>
      `;
      this.container.appendChild(classContext);
    } else {
      const header = document.createElement('h3');
      header.className = 'exam-creator-header';
      header.textContent = 'Create New Exam';
      this.container.appendChild(header);
    }

    // Error message container
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.style.display = 'none';
    this.container.appendChild(errorElement);

    // Title input
    this.titleInput = new Input({
      placeholder: 'Enter exam title...',
      value: this.state.title,
      onChange: (value) => {
        this.setState({ title: value });
      }
    });
    this.container.appendChild(this.titleInput.render());

    // Question type buttons
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

    this.container.appendChild(buttonGroup);

    // Questions container
    this.questionsContainer = document.createElement('div');
    this.questionsContainer.className = 'questions-container';
    this.container.appendChild(this.questionsContainer);

    // Save buttons
    const saveButtonsContainer = document.createElement('div');
    saveButtonsContainer.className = 'save-buttons-container';

    const saveButton = new Button({
      text: 'Save as Draft',
      className: 'btn-secondary',
      onClick: () => this.saveExam(false)
    });

    const publishButton = new Button({
      text: 'Save & Publish',
      className: 'btn-primary',
      onClick: () => this.saveExam(true)
    });

    saveButtonsContainer.appendChild(saveButton.render());
    saveButtonsContainer.appendChild(publishButton.render());
    this.container.appendChild(saveButtonsContainer);

    return this.container;
  }
}