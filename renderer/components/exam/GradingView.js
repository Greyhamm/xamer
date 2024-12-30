import SubmissionAPI from '../../services/api/SubmissionAPI.js';  
import { formatDate } from '../../services/utils/formating.js';
import { MultipleChoiceGrader, WrittenGrader, CodingGrader } from './grading/QuestionGraders/index.js';

export default class GradingView {
  constructor(submission, onGradingComplete) {
    this.submission = submission;
    this.onGradingComplete = onGradingComplete;
    this.state = {
      grades: new Map(),
      loading: false,
      error: null
    };

    this.graders = {
      MultipleChoice: MultipleChoiceGrader,
      Written: WrittenGrader,
      Coding: CodingGrader
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

    if (this.submitButton) {
      this.submitButton.disabled = this.state.loading;
    }
  }

  async submitGrades() {
    try {
      this.setState({ loading: true, error: null });

      // Validate all questions have grades
      for (const answer of this.submission.answers) {
        if (!this.state.grades.has(answer.question)) {
          throw new Error('Please grade all questions before submitting');
        }
      }

      const grades = Array.from(this.state.grades.entries()).map(([questionId, grade]) => ({
        questionId,
        ...grade
      }));

      await SubmissionAPI.gradeSubmission(this.submission._id, grades);
      
      alert('Grades submitted successfully!');
      if (this.onGradingComplete) {
        this.onGradingComplete();
      }
    } catch (error) {
      this.setState({ error: error.message });
    } finally {
      this.setState({ loading: false });
    }
  }

  handleGradeChange(questionId, grade) {
    this.state.grades.set(questionId, grade);
  }

  render() {
    const container = document.createElement('div');
    container.className = 'grading-view-container';

    // Header
    const header = document.createElement('div');
    header.className = 'grading-header';
    header.innerHTML = `
      <h2>${this.submission.exam.title} - Grading</h2>
      <div class="submission-info">
        <p>Student: ${this.submission.student.username}</p>
        <p>Submitted: ${formatDate(this.submission.submittedAt)}</p>
      </div>
    `;

    // Error message
    this.errorElement = document.createElement('div');
    this.errorElement.className = 'error-message';
    this.errorElement.style.display = 'none';

    // Questions
    const questionsContainer = document.createElement('div');
    questionsContainer.className = 'questions-container';

    this.submission.answers.forEach((answer, index) => {
      const question = answer.question;
      const GraderClass = this.graders[question.type];
      
      if (!GraderClass) {
        console.error(`No grader found for question type: ${question.type}`);
        return;
      }

      const grader = new GraderClass({
        question,
        answer,
        onGradeChange: (grade) => this.handleGradeChange(question._id, grade)
      });

      const questionSection = document.createElement('div');
      questionSection.className = 'question-section';
      questionSection.innerHTML = `
        <h3>Question ${index + 1}</h3>
        <div class="question-prompt">${question.prompt}</div>
      `;

      questionSection.appendChild(grader.render());
      questionsContainer.appendChild(questionSection);
    });

    // Submit button
    this.submitButton = document.createElement('button');
    this.submitButton.className = 'btn btn-primary submit-grades';
    this.submitButton.textContent = 'Submit Grades';
    this.submitButton.addEventListener('click', () => this.submitGrades());

    // Back button
    const backButton = document.createElement('button');
    backButton.className = 'btn btn-secondary back-button';
    backButton.textContent = 'Back to Submissions';
    backButton.addEventListener('click', () => {
      if (this.onGradingComplete) {
        this.onGradingComplete();
      }
    });

    // Assemble container
    container.appendChild(header);
    container.appendChild(this.errorElement);
    container.appendChild(questionsContainer);
    container.appendChild(this.submitButton);
    container.appendChild(backButton);

    return container;
  }
}