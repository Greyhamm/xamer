// renderer/components/ExamTaker.js
import { Exam } from '../models/Exam.js';
import { MultipleChoiceQuestion } from '../models/MultipleChoiceQuestion.js';
import { WrittenQuestion } from '../models/WrittenQuestion.js';
import { CodingQuestion } from '../models/CodingQuestion.js';
import MonacoEditorComponent from './MonacoEditor.js';
import DOMHelper from '../helpers/DOMHelper.js'; // Ensure DOMHelper is available

export default class ExamTaker {
  constructor() {
    this.exam = new Exam();
    this.answers = {};
  }

  async fetchExams() {
    try {
      const exams = await window.api.getExams();
      console.log('Fetched Exams:', exams);
      
      // Filter for published exams and ensure they have questions array
      const publishedExams = exams.filter(exam => 
        exam.status === 'published' && exam.questions
      ).map(exam => ({
        ...exam,
        questions: exam.questions || [] // Ensure questions is always an array
      }));
      
      console.log('Published Exams:', publishedExams);
      return publishedExams;
    } catch (err) {
      console.error('Error fetching exams:', err);
      alert('Failed to fetch exams. Please try again.');
      return [];
    }
  }

  async render() {
    const container = DOMHelper.createElement('div', {
      classes: ['exam-taker-container']
    });

    // Loading state
    const loadingMessage = DOMHelper.createElement('p', {
      classes: ['loading-message'],
      text: 'Loading available exams...'
    });
    container.appendChild(loadingMessage);

    try {
      const exams = await this.fetchExams();
      container.innerHTML = ''; // Clear loading message

      if (!exams || exams.length === 0) {
        const noExams = DOMHelper.createElement('p', {
          classes: ['no-exams-message'],
          text: 'No published exams available at the moment.'
        });
        container.appendChild(noExams);
        return container;
      }

      // Exam List
      const examList = DOMHelper.createElement('div', {
        classes: ['exam-list']
      });

      exams.forEach(exam => {
        const examCard = DOMHelper.createElement('div', {
          classes: ['exam-card']
        });

        // Get number of questions safely
        const questionCount = exam.questions ? exam.questions.length : 0;

        examCard.innerHTML = `
          <h3 class="exam-title">${exam.title || 'Untitled Exam'}</h3>
          <p class="exam-info">${questionCount} question${questionCount === 1 ? '' : 's'}</p>
          <button class="btn btn-primary take-exam-btn">Take Exam</button>
        `;

        const takeButton = examCard.querySelector('.take-exam-btn');
        takeButton.addEventListener('click', () => this.startExam(exam._id));

        examList.appendChild(examCard);
      });

      container.appendChild(examList);
    } catch (error) {
      console.error('Error rendering exams:', error);
      container.innerHTML = `
        <p class="error-message">Error loading exams. Please try again later.</p>
      `;
    }

    return container;
  }

  // Add this method
  async loadExam(examId) {
    try {
      const examData = await window.api.getExamById(examId);
      console.log('Loading exam with ID:', examId);
      console.log('Fetched Exam Data:', examData);
      this.exam = new Exam(examData);
      console.log('Deserialized Exam:', this.exam);
      return true;
    } catch (error) {
      console.error('Error loading exam:', error);
      alert('Failed to load exam. Please try again.');
      return false;
    }
  }

  // Update startExam to use loadExam
  async startExam(examId) {
    try {
      const loaded = await this.loadExam(examId);
      if (loaded) {
        const container = document.querySelector('.exam-taker-container');
        if (container) {
          this.renderExam(container);
        }
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Failed to start exam. Please try again.');
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


  renderExam(container) {
    // Clear existing content except the examSelect and loadExamBtn
    container.innerHTML = '';

    const title = DOMHelper.createElement('h2', {
      text: this.exam.title || 'Untitled Exam',
      classes: ['exam-title'],
    });
    container.appendChild(title);

    console.log('Rendering Exam with Questions:', this.exam.questions);

    this.exam.questions.forEach((question, index) => {
      const questionDiv = DOMHelper.createElement('div', { classes: ['question'] });

      // Question Header
      const header = DOMHelper.createElement('h3', {
        classes: ['question-header'],
        text: `Question ${index + 1}`,
      });
      questionDiv.appendChild(header);

      // Question Prompt
      const prompt = DOMHelper.createElement('p', {
        classes: ['question-prompt'],
        text: question.prompt,
      });
      questionDiv.appendChild(prompt);

      // Display Media if exists
      if (question.media && question.media.url) {
        const mediaContainer = DOMHelper.createElement('div', { classes: ['question-media'] });

        if (question.media.type === 'image') {
          const img = DOMHelper.createElement('img', {
            attributes: { src: question.media.url, alt: 'Question Image' },
            classes: ['media-image'],
          });
          mediaContainer.appendChild(img);
        } else if (question.media.type === 'video') {
          const video = DOMHelper.createElement('video', {
            attributes: { src: question.media.url, controls: true },
            classes: ['media-video'],
          });
          mediaContainer.appendChild(video);
        }

        questionDiv.appendChild(mediaContainer);
      }

      // Render Answer Fields based on question type
      if (question.type === 'MultipleChoice') {
        this.renderMultipleChoiceQuestion(question, index, questionDiv);
      }

      if (question.type === 'Written') {
        this.renderWrittenQuestion(question, index, questionDiv);
      }

      if (question.type === 'Coding') {
        this.renderCodingQuestion(question, index, questionDiv);
      }

      container.appendChild(questionDiv);
    });

    // Submit Exam Button
    const submitBtn = DOMHelper.createElement('button', {
      classes: ['btn', 'btn-save'],
      text: 'Submit Exam',
    });
    container.appendChild(submitBtn);

    submitBtn.addEventListener('click', () => {
      this.gradeExam();
    });
  }

  renderMultipleChoiceQuestion(question, index, parentDiv) {
    question.options.forEach((option, i) => {
      const label = DOMHelper.createElement('label', {
        classes: ['mcq-option'],
      });
      const radio = DOMHelper.createElement('input', {
        attributes: {
          type: 'radio',
          name: `question-${index}`,
          value: i,
        },
      });
      radio.addEventListener('change', (e) => {
        this.answers[index] = parseInt(e.target.value);
      });
      label.appendChild(radio);
      label.appendChild(document.createTextNode(option));
      parentDiv.appendChild(label);
      parentDiv.appendChild(document.createElement('br'));
    });
  }

  renderWrittenQuestion(question, index, parentDiv) {
    const textarea = DOMHelper.createElement('textarea', {
      attributes: {
        rows: 4,
        cols: 50,
        placeholder: 'Enter your answer here...',
      },
      classes: ['input-field'],
    });
    textarea.addEventListener('input', (e) => {
      this.answers[index] = e.target.value;
    });
    parentDiv.appendChild(textarea);
  }

  renderCodingQuestion(question, index, parentDiv) {
    // Ensure Monaco is loaded
    if (!window.monaco) {
      const error = DOMHelper.createElement('p', {
        text: 'Monaco Editor is not loaded. Please try again later.',
        classes: ['editor-error'],
      });
      parentDiv.appendChild(error);
      return;
    }
  
    const editorContainer = DOMHelper.createElement('div', {
      classes: ['monaco-editor-container'],
    });
    parentDiv.appendChild(editorContainer);
  
    let monacoInstance;
    try {
      // Initialize Monaco Editor with user code if exists
      const initialCode = question.initialCode || '';
      monacoInstance = new MonacoEditorComponent(editorContainer, {
        language: question.language,
        value: initialCode,
      });
    } catch (err) {
      console.error('Failed to initialize Monaco Editor:', err);
      const error = DOMHelper.createElement('p', {
        text: 'Failed to load code editor.',
        classes: ['editor-error'],
      });
      parentDiv.appendChild(error);
    }
  
    const runBtn = DOMHelper.createElement('button', {
      classes: ['btn', 'btn-run'],
      text: 'Run Code',
    });
    parentDiv.appendChild(runBtn);
  
    const output = DOMHelper.createElement('pre', {
      classes: ['code-output'],
    });
    parentDiv.appendChild(output);
  
    // Run Button Event Listener
    runBtn.addEventListener('click', async () => {
      if (!monacoInstance) {
        output.textContent = 'Code editor is not initialized.';
        return;
      }
  
      // Retrieve the code from the editor
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
  
          // Display logs and result
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
  
          // Display the result
          output.textContent = response.result || '';
        } else if (question.language === 'java') {
          // Send the entire code as a single 'code' field
          response = await window.api.executeJava(userCode);
          console.log(`Java Execution Response for Question ${index + 1}:`, response);
  
          // Display the result
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
      // For example, written answers could be manually graded or have some automated checks
    });
    alert(`Your score: ${score} / ${total}`);
  }
}
