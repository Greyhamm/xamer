// renderer/components/exam/grading/GradingView.js
import Button from '../../common/Button.js';
import AppState from '../../../services/state/AppState.js';
import { MultipleChoiceGrader, WrittenGrader, CodingGrader } from './QuestionGraders/index.js';

// In GradingView.js
export default class GradingView {
  constructor(options) {
    console.log('GradingView constructor called with options:', options);
    
    if (!options?.submissionId) {
      console.error('No submission ID provided to GradingView');
      this.state = {
        error: 'Invalid submission ID',
        loading: false
      };
      return;
    }

    this.state = {
      submissionId: options.submissionId,
      submission: null,
      grades: new Map(),
      loading: true,
      error: null
    };

    // Initialize graders
    this.graders = {
      MultipleChoice: MultipleChoiceGrader,
      Written: WrittenGrader,
      Coding: CodingGrader
    };

    // Load the submission data
    this.loadSubmission();
  }

  async loadSubmission() {
    try {
      console.log('Loading submission:', this.state.submissionId);
      
      if (!this.state.submissionId) {
        throw new Error('No submission ID provided');
      }

      const response = await window.api.getSubmissionById(this.state.submissionId);
      console.log('Submission response:', response);
      
      if (!response || !response.success) {
        throw new Error(response?.error || 'Failed to load submission');
      }

      const submission = response.data;
      if (!submission.exam || !submission.student) {
        throw new Error('Incomplete submission data');
      }

      this.setState({
        submission,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Load submission error:', error);
      this.setState({
        error: error.message || 'Failed to load submission',
        loading: false
      });
    }
  }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        if (this.container) {
            this.updateUI();
        }
    }

    updateUI() {
        const container = this.render();
        this.container.replaceWith(container);
        this.container = container;
    }

    handleGradeChange(questionId, gradeData) {
        const grades = new Map(this.state.grades);
        grades.set(questionId, gradeData);
        this.setState({ grades });
    }

    async submitGrades() {
        try {
            this.setState({ loading: true });

            const gradesToSubmit = Array.from(this.state.grades.entries()).map(([questionId, grade]) => ({
                questionId,
                score: grade.score,
                feedback: grade.feedback
            }));

            const response = await window.api.gradeSubmission(this.state.submissionId, gradesToSubmit);

            if (!response.success) {
                throw new Error(response.error || 'Failed to submit grades');
            }

            alert('Grades submitted successfully!');
            AppState.navigateTo('submissionsList', {
                examId: this.state.submission.exam._id,
                classId: this.state.submission.exam.class
            });
        } catch (error) {
            console.error('Submit grades error:', error);
            this.setState({
                error: error.message,
                loading: false
            });
        }
    }

    render() {
        this.container = document.createElement('div');
        this.container.className = 'grading-view';

        if (this.state.loading) {
            this.container.innerHTML = '<div class="loading">Loading submission...</div>';
            return this.container;
        }

        if (this.state.error) {
            this.container.innerHTML = `
                <div class="error-message">${this.state.error}</div>
                <button class="btn btn-secondary back-btn">Back to Submissions</button>
            `;
            this.container.querySelector('.back-btn').addEventListener('click', () => {
                AppState.navigateTo('submissionsList');
            });
            return this.container;
        }

        if (!this.state.submission) {
            this.container.innerHTML = '<div class="error-message">No submission data available</div>';
            return this.container;
        }

        // Header section
        const header = document.createElement('div');
        header.className = 'grading-header';
        header.innerHTML = `
            <h2>${this.state.submission.exam.title} - Grading</h2>
            <div class="submission-info">
                <p>Student: ${this.state.submission.student.username}</p>
                <p>Submitted: ${new Date(this.state.submission.submitTime).toLocaleString()}</p>
            </div>
        `;
        this.container.appendChild(header);

        // Questions and answers
        const questionsContainer = document.createElement('div');
        questionsContainer.className = 'questions-container';

        this.state.submission.answers.forEach((answer, index) => {
            const questionContainer = document.createElement('div');
            questionContainer.className = 'question-grading-section';

            const questionHeader = document.createElement('h3');
            questionHeader.textContent = `Question ${index + 1}`;
            questionContainer.appendChild(questionHeader);

            const GraderComponent = this.graders[answer.question.type];
            if (GraderComponent) {
                const grader = new GraderComponent({
                    question: answer.question,
                    answer: answer,
                    onGradeChange: (gradeData) => this.handleGradeChange(answer.question._id, gradeData)
                });
                questionContainer.appendChild(grader.render());
            }

            questionsContainer.appendChild(questionContainer);
        });

        this.container.appendChild(questionsContainer);

        // Submit button
        const submitButton = new Button({
            text: 'Submit Grades',
            className: 'btn-primary submit-grades-btn',
            onClick: () => this.submitGrades()
        });
        this.container.appendChild(submitButton.render());

        return this.container;
    }
}