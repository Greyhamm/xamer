// renderer/components/ExamTaker.js
import { Exam } from '../../models/Exam.js';
import { MultipleChoiceQuestion } from '../../models/MultipleChoiceQuestion.js';
import { WrittenQuestion } from '../../models/WrittenQuestion.js';
import { CodingQuestion } from '../../models/CodingQuestion.js';
import MonacoEditorComponent from './MonacoEditor.js';

export default class ExamTaker {
  constructor() {
    this.exam = new Exam();
    this.answers = {};
  }

  async fetchExams() {
    try {
      const response = await fetch('http://localhost:3000/api/exams');
      if (response.ok) {
        const exams = await response.json();
        return exams;
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
        return [];
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch exams. Make sure the backend server is running.');
      return [];
    }
  }

  async fetchExamById(examId) {
    try {
      const response = await fetch(`http://localhost:3000/api/exams/${examId}`);
      if (response.ok) {
        const examData = await response.json();
        this.exam = new Exam(examData);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch exam. Make sure the backend server is running.');
    }
  }

  async render() {
    const container = document.createElement('div');

    const examSelect = document.createElement('select');
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select an Exam';
    examSelect.appendChild(defaultOption);

    // Fetch list of exams
    const exams = await this.fetchExams();
    exams.forEach((exam) => {
      const option = document.createElement('option');
      option.value = exam._id;
      option.textContent = exam.title || 'Untitled Exam';
      examSelect.appendChild(option);
    });

    container.appendChild(examSelect);

    const loadExamBtn = document.createElement('button');
    loadExamBtn.textContent = 'Load Exam';
    container.appendChild(loadExamBtn);

    loadExamBtn.addEventListener('click', async () => {
      const selectedId = examSelect.value;
      if (selectedId === '') {
        alert('Please select an exam.');
        return;
      }
      await this.fetchExamById(selectedId);
      this.renderExam(container);
    });

    return container;
  }

  renderExam(container) {
    // Clear existing content except the examSelect and loadExamBtn
    container.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = this.exam.title || 'Untitled Exam';
    container.appendChild(title);

    this.exam.questions.forEach((question, index) => {
      const questionDiv = document.createElement('div');
      questionDiv.className = 'question';

      const prompt = document.createElement('p');
      prompt.textContent = `${index + 1}. ${question.prompt}`;
      questionDiv.appendChild(prompt);

      if (question.type === 'MultipleChoice') {
        question.options.forEach((option, i) => {
          const label = document.createElement('label');
          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = `question-${index}`;
          radio.value = i;
          radio.addEventListener('change', (e) => {
            this.answers[index] = parseInt(e.target.value);
          });
          label.appendChild(radio);
          label.appendChild(document.createTextNode(option));
          questionDiv.appendChild(label);
          questionDiv.appendChild(document.createElement('br'));
        });
      }

      if (question.type === 'Written') {
        const textarea = document.createElement('textarea');
        textarea.rows = 4;
        textarea.cols = 50;
        textarea.addEventListener('input', (e) => {
          this.answers[index] = e.target.value;
        });
        questionDiv.appendChild(textarea);
      }

      if (question.type === 'Coding') {
        const editorContainer = document.createElement('div');
        editorContainer.style.height = '200px';
        questionDiv.appendChild(editorContainer);

        const monaco = new MonacoEditorComponent(editorContainer, {
          language: question.language,
          value: question.code || '',
        });

        const runBtn = document.createElement('button');
        runBtn.textContent = 'Run Code';
        questionDiv.appendChild(runBtn);

        const output = document.createElement('pre');
        questionDiv.appendChild(output);

        runBtn.addEventListener('click', async () => {
          const userCode = monaco.getValue();
          this.answers[index] = userCode;
          // Secure code execution using VM
          if (question.language === 'javascript') {
            try {
              const result = await this.executeJavaScript(userCode);
              output.textContent = result;
            } catch (err) {
              output.textContent = err.message;
            }
          } else {
            output.textContent = 'Code execution not supported for this language.';
          }
        });
      }

      container.appendChild(questionDiv);
    });

    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit Exam';
    container.appendChild(submitBtn);

    submitBtn.addEventListener('click', () => {
      this.gradeExam();
    });
  }

  async executeJavaScript(code) {
    // Note: Executing code in the renderer process using eval is insecure.
    // For production, implement a secure sandbox or use backend services.
    // Here, we'll use a simple implementation for demonstration purposes.

    return new Promise((resolve, reject) => {
      try {
        const result = eval(code);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  gradeExam() {
    let score = 0;
    this.exam.questions.forEach((question, index) => {
      const answer = this.answers[index];
      if (question.type === 'MultipleChoice') {
        if (answer === question.correctOption) {
          score += 1;
        }
      }
      // Implement grading for other question types as needed
    });
    alert(`Your score: ${score} / ${this.exam.questions.length}`);
  }
}
