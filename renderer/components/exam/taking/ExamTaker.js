import MultipleChoiceRenderer from './QuestionTypes/MultipleChoiceRenderer.js';
import WrittenRenderer from './QuestionTypes/WrittenRenderer.js';
import CodingRenderer from './QuestionTypes/CodingRenderer.js';
import ExamAPI from '../../../services/api/examAPI.js';

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
    }

    // Render current question
    this.renderCurrentQuestion();
  }

  async loadExam(examId) {
    try {
      this.setState({ loading: true, error: null });
      const exam = await ExamAPI.getExamById(examId);
      this.setState({ exam, loading: false });
      return true;
    } catch (error) {
      this.setState({ error: error.message, loading: false });
      return false;
    }
  }

  handleAnswerChange(answer) {
    this.state.answers.set(answer.questionId, answer);
  }

  async submitExam() {
    try {
      this.setState({ loading: true, error: null });

      const answers = Array.from(this.state.answers.values());
      if (answers.length !== this.state.exam.questions.length) {
        throw new Error('Please answer all questions before submitting');
      }

      await ExamAPI.submitExam(this.state.exam._id, {
        answers,
        timeSpent: Math.floor((Date.now() - this.state.timeStarted) / 1000)
      });

      alert('Exam submitted successfully!');
      window.location.reload(); // Return to dashboard
    } catch (error) {
      this.setState({ error: error.message, loading: false });
    }
  }

  renderCurrentQuestion() {
    if (!this.questionContainer) return;

    this.questionContainer.innerHTML = '';

    const question = this.state.exam.questions[this.state.currentQuestionIndex];
    if (!question) return;

    const RendererClass = this.questionRenderers[question.type];
    if (!RendererClass) {
      console.error(`No renderer found for question type: ${question.type}`);
      return;
    }

    const renderer = new RendererClass(question, {
      initialAnswer: this.state.answers.get(question._id),
      onChange: (answer) => this.handleAnswerChange(answer)
    });

    this.questionContainer.appendChild(renderer.render());
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

    // Exam header
    const header = document.createElement('div');
    header.className = 'exam-header';
    header.innerHTML = `<h2>${this.state.exam.title}</h2>`;

    // Progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    this.progressElement = document.createElement('div');
    this.progressElement.className = 'progress';
    progressBar.appendChild(this.progressElement);

    // Question container
    this.questionContainer = document.createElement('div');
    this.questionContainer.className = 'question-container';

    // Navigation buttons
    const navigation = document.createElement('div');
    navigation.className = 'exam-navigation';

    this.prevButton = document.createElement('button');
    this.prevButton.className = 'btn btn-secondary';
    this.prevButton.textContent = 'Previous';
    this.prevButton.addEventListener('click', () => {
      if (this.state.currentQuestionIndex > 0) {
        this.setState({ currentQuestionIndex: this.state.currentQuestionIndex - 1 });
      }
    });

    this.nextButton = document.createElement('button');
    this.nextButton.className = 'btn btn-primary';
    this.nextButton.addEventListener('click', () => {
      const isLast = this.state.currentQuestionIndex === this.state.exam.questions.length - 1;
      if (isLast) {
        this.submitExam();
      } else {
        this.setState({ currentQuestionIndex: this.state.currentQuestionIndex + 1 });
      }
    });

    navigation.appendChild(this.prevButton);
    navigation.appendChild(this.nextButton);

    // Assemble container
    this.container.appendChild(header);
    this.container.appendChild(progressBar);
    this.container.appendChild(this.questionContainer);
    this.container.appendChild(navigation);

    this.updateUI();
    return this.container;
  }
}