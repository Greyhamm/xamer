// renderer/components/exam/grading/GradingView.js
import { MultipleChoiceGrader, WrittenGrader, CodingGrader } from './QuestionGraders/index.js';

export default class GradingView {
    constructor(options) {
        this.submissionId = options?.submissionId;
        this.state = {
            submission: null,
            grades: new Map(),
            loading: true,
            error: null
        };

        this.graders = {
            MultipleChoice: MultipleChoiceGrader,
            Written: WrittenGrader,
            Coding: CodingGrader
        };

        this.graderInstances = new Map();
        this.container = null;
    }

    setState(newState) {
        const prevState = this.state;
        this.state = { ...this.state, ...newState };
        
        // Only update UI if needed
        if (JSON.stringify(prevState) !== JSON.stringify(this.state)) {
            requestAnimationFrame(() => this.updateUI());
        }
    }

    async loadSubmission() {
        try {
            const response = await window.api.getSubmissionById(this.submissionId);
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to load submission');
            }

            const submission = response.data;
            
            // Match answers with questions
            submission.answers = submission.answers.map(answer => {
                const matchingQuestion = submission.exam.questions.find(q => 
                    q._id === answer.question || q._id === answer.questionId
                );
                return {
                    ...answer,
                    questionData: matchingQuestion // Store full question data
                };
            });

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

    handleGradeChange(questionId, gradeData) {
        const newGrades = new Map(this.state.grades);
        newGrades.set(questionId, gradeData);
        this.setState({ grades: newGrades });
    }

    createGrader(answer, index) {
        const question = answer.questionData;
        if (!question) return null;

        const graderId = `grader-${question._id}`;
        if (this.graderInstances.has(graderId)) {
            return this.graderInstances.get(graderId);
        }

        const GraderComponent = this.graders[question.type];
        if (!GraderComponent) return null;

        const grader = new GraderComponent({
            question,
            answer: {
                ...answer,
                question: question // Ensure question data is available
            },
            onGradeChange: (gradeData) => {
                this.handleGradeChange(question._id, gradeData);
            }
        });

        this.graderInstances.set(graderId, grader);
        return grader;
    }

    renderQuestions() {
        if (!this.state.submission?.answers) return null;

        const container = document.createElement('div');
        container.className = 'questions-container';

        this.state.submission.answers.forEach((answer, index) => {
            const questionSection = document.createElement('div');
            questionSection.className = 'question-grading-section';

            const header = document.createElement('h3');
            header.textContent = `Question ${index + 1}`;
            questionSection.appendChild(header);

            // Display question prompt
            if (answer.questionData?.prompt) {
                const prompt = document.createElement('div');
                prompt.className = 'question-prompt';
                prompt.textContent = answer.questionData.prompt;
                questionSection.appendChild(prompt);

                // Display student's answer
                const answerDisplay = document.createElement('div');
                answerDisplay.className = 'student-answer';
                answerDisplay.innerHTML = `<strong>Student's Answer:</strong> ${answer.answer}`;
                questionSection.appendChild(answerDisplay);

                // Create and render appropriate grader
                const grader = this.createGrader(answer, index);
                if (grader) {
                    questionSection.appendChild(grader.render());
                }
            }

            container.appendChild(questionSection);
        });

        return container;
    }

    async submitGrades() {
        try {
            this.setState({ loading: true });

            const gradesToSubmit = Array.from(this.state.grades.entries())
                .map(([questionId, grade]) => ({
                    questionId,
                    ...grade
                }));

            const response = await window.api.gradeSubmission(
                this.submissionId,
                gradesToSubmit
            );

            if (!response.success) {
                throw new Error(response.error || 'Failed to submit grades');
            }

            alert('Grades submitted successfully!');
            window.location.hash = '#/submissions';
        } catch (error) {
            console.error('Submit grades error:', error);
            this.setState({
                error: error.message,
                loading: false
            });
        }
    }

    updateUI() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        
        if (this.state.loading) {
            const loading = document.createElement('div');
            loading.className = 'loading';
            loading.textContent = 'Loading submission...';
            this.container.appendChild(loading);
            return;
        }

        if (this.state.error) {
            const error = document.createElement('div');
            error.className = 'error-message';
            error.textContent = this.state.error;
            this.container.appendChild(error);
            return;
        }

        if (!this.state.submission) {
            const noData = document.createElement('div');
            noData.className = 'error-message';
            noData.textContent = 'No submission data available';
            this.container.appendChild(noData);
            return;
        }

        // Header
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

        // Questions
        const questionsContainer = this.renderQuestions();
        if (questionsContainer) {
            this.container.appendChild(questionsContainer);
        }

        // Submit button
        const submitButton = document.createElement('button');
        submitButton.className = 'btn btn-primary submit-grades-btn';
        submitButton.textContent = 'Submit Grades';
        submitButton.addEventListener('click', () => this.submitGrades());
        this.container.appendChild(submitButton);
    }

    render() {
        this.container = document.createElement('div');
        this.container.className = 'grading-view';

        // Initial load
        if (!this.state.submission && !this.state.error) {
            this.loadSubmission();
        }

        this.updateUI();
        return this.container;
    }

    dispose() {
        this.graderInstances.forEach(grader => {
            if (grader.dispose) {
                grader.dispose();
            }
        });
        this.graderInstances.clear();
    }
}