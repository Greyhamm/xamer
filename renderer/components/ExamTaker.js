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
      const exams = await window.api.getExams();
      console.log('Fetched Exams:', exams);
      return exams;
    } catch (err) {
      console.error(err);
      alert('Failed to fetch exams. Make sure the backend server is running.');
      return [];
    }
  }

  async fetchExamById(examId) {
    try {
      const examData = await window.api.getExamById(examId);
      console.log('Fetched Exam Data:', examData);
      this.exam = new Exam(examData);
      console.log('Deserialized Exam:', this.exam);
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
    if (exams.length === 0) {
      const noExamsMsg = document.createElement('p');
      noExamsMsg.textContent = 'No exams available. Please create an exam first.';
      container.appendChild(noExamsMsg);
      return container;
    }

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
    
    return container; // Returns a DOM Node
  }

  renderExam(container) {
    // Clear existing content except the examSelect and loadExamBtn
    container.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = this.exam.title || 'Untitled Exam';
    container.appendChild(title);

    console.log('Rendering Exam with Questions:', this.exam.questions);

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
        // Ensure Monaco is loaded
        if (!window.monaco) {
          const error = document.createElement('p');
          error.textContent = 'Monaco Editor is not loaded. Please try again later.';
          error.style.color = 'red';
          questionDiv.appendChild(error);
          return;
        }

        const editorContainer = document.createElement('div');
        editorContainer.style.height = '200px';
        questionDiv.appendChild(editorContainer);

        let monacoInstance;
        try {
          monacoInstance = new MonacoEditorComponent(editorContainer, {
            language: question.language,
            value: question.code || '// Write your code here',
          });
        } catch (err) {
          console.error('Failed to initialize Monaco Editor:', err);
          const error = document.createElement('p');
          error.textContent = 'Failed to load code editor.';
          error.style.color = 'red';
          questionDiv.appendChild(error);
        }

        const runBtn = document.createElement('button');
        runBtn.textContent = 'Run Code';
        questionDiv.appendChild(runBtn);

        const output = document.createElement('pre');
        questionDiv.appendChild(output);

        // Updated runBtn event listener
        runBtn.addEventListener('click', async () => {
          if (!monacoInstance) {
            output.textContent = 'Code editor is not initialized.';
            return;
          }

          const userCode = monacoInstance.getValue();
          this.answers[index] = userCode;

          console.log(`Executing Code for Question ${index + 1}:`, userCode);
          console.log(`Selected Language: ${question.language}`);

          // Secure code execution using backend
          try {
            let response;
            if (question.language === 'javascript') {
              response = await window.api.executeJavaScript(userCode);
              console.log(`Execution Response for Question ${index + 1}:`, response);
              
              // Update the frontend to display logs and result
              output.textContent = '';

              if (response.logs && response.logs.length > 0) {
                output.textContent += response.logs.join('\n') + '\n';
              }
              if (response.result) {
                output.textContent += response.result;
              }
            } else if (question.language === 'python') {
              response = await window.api.executePython(userCode);
              console.log(`Python Execution Response for Question ${index + 1}:`, response);
              
              // Update the frontend to display the result
              output.textContent = response.result || '';
            } else if (question.language === 'java') {
              response = await window.api.executeJava(userCode);
              console.log(`Java Execution Response for Question ${index + 1}:`, response);
              
              // Update the frontend to display the result
              output.textContent = response.result || '';
            } else {
              output.textContent = 'Code execution not supported for this language.';
            }
          } catch (err) {
            console.error(`Error Executing Code for Question ${index + 1}:`, err);
            output.textContent = err.message;
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

  gradeExam() {
    let score = 0;
    let total = 0;
    this.exam.questions.forEach((question, index) => {
      const answer = this.answers[index];
      if (question.type === 'MultipleChoice') {
        total += 1;
        if (answer === question.correctOption) {
          score += 1;
        }
      }
      // Implement grading for other question types as needed
    });
    alert(`Your score: ${score} / ${total}`);
  }
}
