import MultipleChoiceRenderer from './QuestionTypes/MultipleChoiceRenderer.js';
import WrittenRenderer from './QuestionTypes/WrittenRenderer.js';
import CodingRenderer from './QuestionTypes/CodingRenderer.js';

export default class ExamTaker {
  constructor() {
    this.state = {
      exam: null,
      currentQuestionIndex: 0,
      answers: new Map(),
      loading: false,
      error: null,
      timeStarted: Date.now()
    };

    this.questionRenderers = {
      MultipleChoice: MultipleChoiceRenderer,
      Written: WrittenRenderer,
      Coding: CodingRenderer
    };

    this.currentRenderer = null;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.updateUI();
  }

  updateUI() {
    if (!this.container) return;

    // Update progress indicator
    if (this.progressElement) {
      const progress = ((this.state.currentQuestionIndex + 1) / this.state.exam.questions.length) * 100;
      this.progressElement.style.width = `${progress}%`;
      this.progressElement.textContent = `Question ${this.state.currentQuestionIndex + 1} of ${this.state.exam.questions.length}`;
    }

    // Update navigation buttons
    if (this.prevButton) {
      this.prevButton.disabled = this.state.currentQuestionIndex === 0;
    }
    if (this.nextButton) {
      const isLast = this.state.currentQuestionIndex === this.state.exam.questions.length - 1;
      this.nextButton.textContent = isLast ? 'Submit Exam' : 'Next Question';
      this.nextButton.disabled = this.state.loading;
    }

    // Show error message if any
    if (this.errorElement) {
      this.errorElement.style.display = this.state.error ? 'block' : 'none';
      if (this.state.error) {
        this.errorElement.textContent = this.state.error;
      }
    }

    this.renderCurrentQuestion();
  }

  async loadExam(examId) {
    try {
      this.setState({ loading: true, error: null });
      const examResponse = await window.api.getExamById(examId);
      if (!examResponse.success) {
        throw new Error(examResponse.error || 'Failed to load exam');
      }
      this.setState({ exam: examResponse.data, loading: false });
      return true;
    } catch (error) {
      this.setState({ error: error.message, loading: false });
      return false;
    }
  }
  validateAnswers() {
    const { exam, answers } = this.state;
    const unansweredQuestions = exam.questions.filter(question => {
      const answer = answers.get(question._id);
      if (!answer) return true;

      switch (question.type) {
        case 'MultipleChoice':
          return answer.selectedOption === null || answer.selectedOption === undefined;
        case 'Written':
          return !answer.answer || answer.answer.trim() === '';
        case 'Coding':
          return !answer.answer || answer.answer.trim() === '';
        default:
          return true;
      }
    });

    if (unansweredQuestions.length > 0) {
      const questionNumbers = unansweredQuestions.map((q) => {
        const index = exam.questions.findIndex(eq => eq._id === q._id);
        return index + 1;
      });
      
      const questionTypes = unansweredQuestions.map(q => q.type);
      const errorMessage = `Please answer all questions. Question${questionNumbers.length > 1 ? 's' : ''} ${questionNumbers.join(', ')} (${questionTypes.join(', ')}) ${questionNumbers.length > 1 ? 'are' : 'is'} incomplete.`;
      
      this.setState({ error: errorMessage });
      return false;
    }
    return true;
  }

  handleAnswerChange(answer) {
    const { answers } = this.state;
    const currentQuestion = this.state.exam.questions[this.state.currentQuestionIndex];
    
    // Ensure we have all required fields
    const fullAnswer = {
      ...answer,
      questionId: currentQuestion._id,
      questionType: currentQuestion.type,
      timeSpent: Math.floor((Date.now() - this.state.timeStarted) / 1000)
    };

    // Store the answer
    answers.set(currentQuestion._id, fullAnswer);
    
    // Log the stored answer for debugging
    console.log('Stored answer:', {
      questionId: fullAnswer.questionId,
      type: fullAnswer.questionType,
      answer: fullAnswer.answer,
      answerLength: fullAnswer.answer ? fullAnswer.answer.length : 0
    });

    this.setState({ answers });
  }

  renderCurrentQuestion() {
    if (!this.questionContainer) return;

    // Store current answer if it exists
    if (this.currentRenderer?.getValue) {
      const currentAnswer = this.currentRenderer.getValue();
      if (currentAnswer && currentAnswer.answer) {
        this.state.answers.set(currentAnswer.questionId, currentAnswer);
      }
    }

    // Clean up previous renderer
    if (this.currentRenderer?.dispose) {
      this.currentRenderer.dispose();
    }

    this.questionContainer.innerHTML = '';

    const question = this.state.exam.questions[this.state.currentQuestionIndex];
    if (!question) return;

    const RendererClass = this.questionRenderers[question.type];
    if (!RendererClass) {
      console.error(`No renderer found for question type: ${question.type}`);
      return;
    }

    const existingAnswer = this.state.answers.get(question._id);

    // Create new renderer without triggering immediate state update
    this.currentRenderer = new RendererClass(question, {
      initialAnswer: existingAnswer,
      onChange: (answer) => {
        // Only update if answer actually changed
        const current = this.state.answers.get(answer.questionId);
        if (!current || current.answer !== answer.answer) {
          this.handleAnswerChange(answer);
        }
      }
    });

    this.questionContainer.appendChild(this.currentRenderer.render());
}

  async submitExam() {
    try {
      // Store the current answer before validation
      if (this.currentRenderer?.getValue) {
        const currentAnswer = this.currentRenderer.getValue();
        if (currentAnswer && currentAnswer.questionId) {
          this.state.answers.set(currentAnswer.questionId, {
            questionId: currentAnswer.questionId,
            answer: currentAnswer.answer || currentAnswer.selectedOption, // Handle multiple choice
            timeSpent: Math.floor((Date.now() - this.state.timeStarted) / 1000)
          });
        }
      }

      if (!this.validateAnswers()) {
        return;
      }

      this.setState({ loading: true, error: null });

      const formattedAnswers = Array.from(this.state.answers.values())
        .filter(answer => answer && answer.questionId)
        .map(answer => ({
          questionId: answer.questionId,
          answer: answer.answer,
          timeSpent: answer.timeSpent || 0
        }));

      console.log('Submitting exam data:', {
        examId: this.state.exam._id,
        answers: formattedAnswers
      });

      const response = await window.api.submitExam(this.state.exam._id, formattedAnswers);

      if (!response.success) {
        throw new Error(response.error || 'Failed to submit exam');
      }

      alert('Exam submitted successfully!');
      window.location.hash = '#/dashboard';
      
    } catch (error) {
      console.error('Submit exam error:', error);
      this.setState({ 
        error: error.message || 'Failed to submit exam. Please try again.', 
        loading: false 
      });
    }
  }

  navigateToQuestion(index) {
    if (index >= 0 && index < this.state.exam.questions.length) {
      this.setState({ currentQuestionIndex: index });
    }
  }

  render() {
    this.container = document.createElement('div');
    this.container.className = 'exam-taker-container';

    if (this.state.loading) {
      this.container.innerHTML = '<div class="loading">Loading exam...</div>';
      return this.container;
    }

    if (this.state.error) {
      this.container.innerHTML = `<div class="error">${this.state.error}</div>`;
      return this.container;
    }

    if (!this.state.exam) {
      this.container.innerHTML = '<div class="error">No exam loaded</div>';
      return this.container;
    }

    // Error message container
    this.errorElement = document.createElement('div');
    this.errorElement.className = 'error-message';
    this.errorElement.style.display = 'none';
    this.container.appendChild(this.errorElement);

    // Exam header
    const header = document.createElement('div');
    header.className = 'exam-header';
    header.innerHTML = `<h2>${this.state.exam.title}</h2>`;
    this.container.appendChild(header);

    // Progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    this.progressElement = document.createElement('div');
    this.progressElement.className = 'progress';
    progressBar.appendChild(this.progressElement);
    this.container.appendChild(progressBar);

    // Question container
    this.questionContainer = document.createElement('div');
    this.questionContainer.className = 'question-container';
    this.container.appendChild(this.questionContainer);

    // Navigation buttons
    const navigation = document.createElement('div');
    navigation.className = 'exam-navigation';

    this.prevButton = document.createElement('button');
    this.prevButton.className = 'btn btn-secondary';
    this.prevButton.textContent = 'Previous';
    this.prevButton.addEventListener('click', () => {
      this.navigateToQuestion(this.state.currentQuestionIndex - 1);
    });

    this.nextButton = document.createElement('button');
    this.nextButton.className = 'btn btn-primary';
    this.nextButton.addEventListener('click', () => {
      const isLast = this.state.currentQuestionIndex === this.state.exam.questions.length - 1;
      if (isLast) {
        this.submitExam();
      } else {
        this.navigateToQuestion(this.state.currentQuestionIndex + 1);
      }
    });

    navigation.appendChild(this.prevButton);
    navigation.appendChild(this.nextButton);
    this.container.appendChild(navigation);

    this.updateUI();
    return this.container;
  }
}