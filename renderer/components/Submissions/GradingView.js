// renderer/components/Submissions/GradingView.js
import DOMHelper from '../../helpers/DOMHelper.js';
import SubmissionsView from './SubmissionsView.js';

export default class GradingView {
  constructor(submission) {
    this.submission = submission;
    this.grades = new Map(); // Store grades for each question
    this.feedback = new Map(); // Store feedback for each question
  }

  render() {
    const container = DOMHelper.createElement('div', {
      classes: ['grading-container']
    });

    // Header
    const header = DOMHelper.createElement('div', {
      classes: ['grading-header']
    });

    const title = DOMHelper.createElement('h2', {
      text: `Grading: ${this.submission.exam.title}`,
      classes: ['grading-title']
    });

    const studentInfo = DOMHelper.createElement('p', {
      text: `Student: ${this.submission.student.username}`,
      classes: ['student-info']
    });

    header.appendChild(title);
    header.appendChild(studentInfo);
    container.appendChild(header);

    // Answers and Grading Form
    const gradingForm = DOMHelper.createElement('form', {
      classes: ['grading-form']
    });

    this.submission.answers.forEach((answer, index) => {
      const questionSection = this.createQuestionGradingSection(answer, index);
      gradingForm.appendChild(questionSection);
    });

    // Submit Button
    const submitButton = DOMHelper.createElement('button', {
      classes: ['btn', 'btn-primary', 'submit-grades'],
      text: 'Submit Grades',
      attributes: { type: 'submit' }
    });

    gradingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.submitGrades();
    });

    gradingForm.appendChild(submitButton);
    container.appendChild(gradingForm);

    // Back Button
    const backButton = DOMHelper.createElement('button', {
      classes: ['btn', 'btn-secondary', 'back-button'],
      text: 'Back to Submissions'
    });

    backButton.addEventListener('click', () => {
      const mainContent = document.getElementById('main-content');
      const submissionsView = new SubmissionsView();
      mainContent.innerHTML = '';
      mainContent.appendChild(submissionsView.render());
    });

    container.appendChild(backButton);

    return container;
  }

  createQuestionGradingSection(answer, index) {
    const section = DOMHelper.createElement('div', {
      classes: ['question-grading-section']
    });

    // Question Info
    const questionInfo = DOMHelper.createElement('div', {
      classes: ['question-info']
    });

    const questionTitle = DOMHelper.createElement('h3', {
      text: `Question ${index + 1}`,
      classes: ['question-title']
    });
    questionInfo.appendChild(questionTitle);

    // Student's Answer
    const answerDisplay = DOMHelper.createElement('div', {
      classes: ['student-answer']
    });

    const answerLabel = DOMHelper.createElement('h4', {
      text: 'Student\'s Answer:',
      classes: ['answer-label']
    });
    answerDisplay.appendChild(answerLabel);

    // Display answer based on question type
    const answerContent = this.renderAnswer(answer);
    answerDisplay.appendChild(answerContent);

    // Grading Input
    const gradingInputs = DOMHelper.createElement('div', {
      classes: ['grading-inputs']
    });

    // Score Input
    const scoreGroup = DOMHelper.createElement('div', {
      classes: ['form-group']
    });

    const scoreLabel = DOMHelper.createElement('label', {
      attributes: { for: `score-${index}` },
      text: 'Score:'
    });

    const scoreInput = DOMHelper.createElement('input', {
      attributes: {
        type: 'number',
        id: `score-${index}`,
        min: '0',
        max: '100',
        required: 'true'
      },
      classes: ['score-input']
    });

    scoreInput.addEventListener('change', (e) => {
      this.grades.set(answer.questionId, parseInt(e.target.value));
    });

    scoreGroup.appendChild(scoreLabel);
    scoreGroup.appendChild(scoreInput);

    // Feedback Input
    const feedbackGroup = DOMHelper.createElement('div', {
      classes: ['form-group']
    });

    const feedbackLabel = DOMHelper.createElement('label', {
      attributes: { for: `feedback-${index}` },
      text: 'Feedback:'
    });

    const feedbackInput = DOMHelper.createElement('textarea', {
      attributes: {
        id: `feedback-${index}`,
        rows: '3'
      },
      classes: ['feedback-input']
    });

    feedbackInput.addEventListener('input', (e) => {
      this.feedback.set(answer.questionId, e.target.value);
    });

    feedbackGroup.appendChild(feedbackLabel);
    feedbackGroup.appendChild(feedbackInput);

    gradingInputs.appendChild(scoreGroup);
    gradingInputs.appendChild(feedbackGroup);

    // Assemble the section
    section.appendChild(questionInfo);
    section.appendChild(answerDisplay);
    section.appendChild(gradingInputs);

    return section;
  }

  renderAnswer(answer) {
    const container = DOMHelper.createElement('div', {
      classes: ['answer-content']
    });

    switch (answer.questionType) {
      case 'MultipleChoice':
        container.textContent = `Selected Option: ${answer.selectedOption + 1}`;
        break;
      case 'Written':
        container.textContent = answer.answer;
        break;
      case 'Coding':
        const pre = DOMHelper.createElement('pre', {
          classes: ['code-answer']
        });
        pre.textContent = answer.answer;
        container.appendChild(pre);
        break;
      default:
        container.textContent = 'Unknown answer type';
    }

    return container;
  }

  async submitGrades() {
    try {
      const grades = Array.from(this.submission.answers).map(answer => ({
        questionId: answer.questionId,
        score: this.grades.get(answer.questionId) || 0,
        feedback: this.feedback.get(answer.questionId) || ''
      }));

      await window.api.gradeSubmission(this.submission._id, grades);
      alert('Grades submitted successfully!');

      // Return to submissions list
      const mainContent = document.getElementById('main-content');
      const submissionsView = new SubmissionsView();
      mainContent.innerHTML = '';
      mainContent.appendChild(submissionsView.render());
    } catch (error) {
      console.error('Error submitting grades:', error);
      alert('Failed to submit grades. Please try again.');
    }
  }
}