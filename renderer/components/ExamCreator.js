// renderer/components/ExamCreator.js
import { Exam } from '../../models/Exam.js';
import { MultipleChoiceQuestion } from '../../models/MultipleChoiceQuestion.js';
import { WrittenQuestion } from '../../models/WrittenQuestion.js';
import { CodingQuestion } from '../../models/CodingQuestion.js';
import ApiService from '../services/ApiService.js';
import EditorService from '../services/EditorService.js';
import DOMHelper from '../helpers/DOMHelper.js';

export default class ExamCreator {
  constructor() {
    this.exam = new Exam();
    this.editorService = new EditorService();
    this.monacoEditors = new Map(); // To manage Monaco instances for coding questions
    this.mediaFiles = new Map(); // To store media files temporarily
  }

  render() {
    const container = DOMHelper.createElement('div', { classes: ['exam-creator-container'] });

    // Render Header
    container.appendChild(this.renderHeader());

    // Render Exam Title Input
    container.appendChild(this.renderExamTitleInput());

    // Render Add Question Buttons
    container.appendChild(this.renderAddQuestionButtons());

    // Render Questions Container
    const questionsContainer = DOMHelper.createElement('div', { classes: ['questions-container'] });
    container.appendChild(questionsContainer);

    // Render Save Exam Button
    container.appendChild(this.renderSaveExamButton(questionsContainer));

    return container; // Ensure this is an HTMLElement
  }

  renderHeader() {
    const header = DOMHelper.createElement('h2', {
      classes: ['exam-creator-header'],
      text: 'Create a New Exam',
    });
    return header;
  }

  renderExamTitleInput() {
    const titleContainer = DOMHelper.createElement('div', { classes: ['form-group'] });

    const titleLabel = DOMHelper.createElement('label', {
      attributes: { for: 'exam-title' },
      text: 'Exam Title',
    });
    titleContainer.appendChild(titleLabel);

    const titleInput = DOMHelper.createElement('input', {
      attributes: {
        type: 'text',
        id: 'exam-title',
        placeholder: 'Enter exam title here...',
      },
      classes: ['input-field'],
    });

    // Event Listener to Update Exam Title
    titleInput.addEventListener('input', (e) => {
      this.exam.title = e.target.value;
    });

    titleContainer.appendChild(titleInput);
    return titleContainer;
  }

  renderAddQuestionButtons() {
    const buttonGroup = DOMHelper.createElement('div', { classes: ['button-group'] });

    const addMCQBtn = DOMHelper.createElement('button', {
      classes: ['btn', 'btn-add'],
      text: 'Add Multiple Choice Question',
    });
    addMCQBtn.addEventListener('click', () => this.addQuestion(new MultipleChoiceQuestion()));
    buttonGroup.appendChild(addMCQBtn);

    const addWrittenBtn = DOMHelper.createElement('button', {
      classes: ['btn', 'btn-add'],
      text: 'Add Written Question',
    });
    addWrittenBtn.addEventListener('click', () => this.addQuestion(new WrittenQuestion()));
    buttonGroup.appendChild(addWrittenBtn);

    const addCodingBtn = DOMHelper.createElement('button', {
      classes: ['btn', 'btn-add'],
      text: 'Add Coding Question',
    });
    addCodingBtn.addEventListener('click', () => this.addQuestion(new CodingQuestion()));
    buttonGroup.appendChild(addCodingBtn);

    return buttonGroup;
  }

  addQuestion(question) {
    this.exam.addQuestion(question);
    const questionsContainer = document.querySelector('.questions-container');
    if (questionsContainer) {
      questionsContainer.appendChild(this.createQuestionElement(question));
    }
  }

  createQuestionElement(question) {
    const div = DOMHelper.createElement('div', { classes: ['question'] });

    // Render Question Header with Remove Button
    div.appendChild(this.renderQuestionHeader(question, div));

    // Render Question Prompt Input
    div.appendChild(this.renderQuestionPrompt(question));

    // Render Media Upload Section
    div.appendChild(this.renderMediaUpload(question));

    // Render Specific Fields Based on Question Type
    switch (question.type) {
      case 'MultipleChoice':
        div.appendChild(this.renderMCQFields(question));
        break;
      case 'Coding':
        div.appendChild(this.renderCodingFields(question));
        break;
      case 'Written':
        // If there are specific fields for Written questions, render them here
        break;
      default:
        console.warn(`Unknown question type: ${question.type}`);
    }

    return div;
  }

  renderQuestionHeader(question, parentDiv) {
    const questionHeader = DOMHelper.createElement('div', { classes: ['question-header'] });

    const questionTitle = DOMHelper.createElement('h3', {
      classes: ['question-title'],
      text: `Question ${this.exam.questions.length}`,
    });
    questionHeader.appendChild(questionTitle);

    const removeBtn = DOMHelper.createElement('button', {
      classes: ['btn', 'btn-remove'],
      text: 'Remove',
    });
    removeBtn.addEventListener('click', () => this.removeQuestion(question, parentDiv));
    questionHeader.appendChild(removeBtn);

    return questionHeader;
  }

  removeQuestion(question, questionDiv) {
    // Remove question from the exam
    this.exam.removeQuestion(question);

    // Dispose Monaco Editor if it's a coding question
    if (question.type === 'Coding' && this.monacoEditors.has(question.id)) {
      this.editorService.disposeEditor(question.id);
      this.monacoEditors.delete(question.id);
    }

    // Remove the question element from the DOM
    questionDiv.remove();

    // Update question numbering
    this.updateQuestionNumbers();
  }

  renderQuestionPrompt(question) {
    const promptContainer = DOMHelper.createElement('div', { classes: ['form-group'] });

    const promptLabel = DOMHelper.createElement('label', {
      attributes: { for: `prompt-${question.id}` },
      text: 'Question Prompt',
    });
    promptContainer.appendChild(promptLabel);

    const promptInput = DOMHelper.createElement('input', {
      attributes: {
        type: 'text',
        id: `prompt-${question.id}`,
        placeholder: 'Enter question prompt here...',
      },
      classes: ['input-field'],
      value: question.prompt,
    });

    // Event Listener to Update Question Prompt
    promptInput.addEventListener('input', (e) => {
      question.prompt = e.target.value;
    });

    promptContainer.appendChild(promptInput);
    return promptContainer;
  }

  renderMCQFields(question) {
    const mcqContainer = DOMHelper.createElement('div', { classes: ['mcq-container'] });

    // Render Options Inputs
    question.options.forEach((option, index) => {
      const optionContainer = DOMHelper.createElement('div', { classes: ['form-group', 'option-container'] });

      const optionLabel = DOMHelper.createElement('label', {
        attributes: { for: `option-${question.id}-${index}` },
        text: `Option ${index + 1}`,
      });
      optionContainer.appendChild(optionLabel);

      const optionInput = DOMHelper.createElement('input', {
        attributes: {
          type: 'text',
          id: `option-${question.id}-${index}`,
          placeholder: `Enter option ${index + 1} text...`,
        },
        classes: ['input-field'],
        value: option,
      });

      // Event Listener to Update Option Text
      optionInput.addEventListener('input', (e) => {
        question.options[index] = e.target.value;
      });

      optionContainer.appendChild(optionInput);
      mcqContainer.appendChild(optionContainer);
    });

    // Render Correct Option Selector
    const correctOptionContainer = DOMHelper.createElement('div', { classes: ['form-group'] });

    const correctOptionLabel = DOMHelper.createElement('label', {
      attributes: { for: `correct-option-${question.id}` },
      text: 'Correct Option',
    });
    correctOptionContainer.appendChild(correctOptionLabel);

    const correctSelect = DOMHelper.createElement('select', {
      attributes: { id: `correct-option-${question.id}` },
      classes: ['select-field'],
      value: question.correctOption,
    });

    ['Option 1', 'Option 2', 'Option 3', 'Option 4'].forEach((opt, i) => {
      const option = DOMHelper.createElement('option', {
        attributes: { value: i },
        text: opt,
      });
      correctSelect.appendChild(option);
    });

    // Event Listener to Update Correct Option
    correctSelect.addEventListener('change', (e) => {
      question.correctOption = parseInt(e.target.value);
    });

    correctOptionContainer.appendChild(correctSelect);
    mcqContainer.appendChild(correctOptionContainer);

    return mcqContainer;
  }

  renderCodingFields(question) {
    const codingContainer = DOMHelper.createElement('div', { classes: ['coding-container'] });
    this.monacoEditors.set(question.id, null); // Initialize with null

    // Render Language Selection
    codingContainer.appendChild(this.renderLanguageSelection(question));

    // Render Initial Code Label
    const initialCodeLabel = DOMHelper.createElement('label', {
      classes: ['initial-code-label'],
      text: 'Initial Code:',
    });
    codingContainer.appendChild(initialCodeLabel);

    // Render Monaco Editor Container
    const editorContainer = DOMHelper.createElement('div', { classes: ['monaco-editor-container'] });
    codingContainer.appendChild(editorContainer);

    // Initialize Monaco Editor
    const editorId = question.id; // Assuming each question has a unique ID
    try {
      const editor = this.editorService.createEditor(editorContainer, {
        language: question.language,
        value: question.initialCode,
        onChange: (value) => {
          question.initialCode = value;
        },
      }, editorId);
      this.monacoEditors.set(question.id, editor);
    } catch (err) {
      console.error('Failed to initialize Monaco Editor:', err);
      const error = DOMHelper.createElement('p', {
        text: 'Failed to load code editor.',
        classes: ['editor-error'],
      });
      codingContainer.appendChild(error);
    }

    return codingContainer;
  }

  renderLanguageSelection(question) {
    const languageContainer = DOMHelper.createElement('div', { classes: ['form-group'] });

    const languageLabel = DOMHelper.createElement('label', {
      attributes: { for: `language-${question.id}` },
      text: 'Programming Language',
    });
    languageContainer.appendChild(languageLabel);

    const languageSelect = DOMHelper.createElement('select', {
      attributes: { id: `language-${question.id}` },
      classes: ['select-field'],
      value: question.language,
    });

    ['javascript', 'python', 'java'].forEach((lang) => {
      const option = DOMHelper.createElement('option', {
        attributes: { value: lang },
        text: lang.charAt(0).toUpperCase() + lang.slice(1),
      });
      languageSelect.appendChild(option);
    });

    // Event Listener to Update Language
    languageSelect.addEventListener('change', (e) => {
      const newLanguage = e.target.value;
      question.language = newLanguage;

      // Update Monaco Editor Language
      if (this.monacoEditors.has(question.id)) {
        this.editorService.updateEditorLanguage(question.id, newLanguage);
      }
    });

    languageContainer.appendChild(languageSelect);
    return languageContainer;
  }

  renderMediaUpload(question) {
    const mediaContainer = DOMHelper.createElement('div', { classes: ['media-container'] });

    const mediaLabel = DOMHelper.createElement('label', {
      attributes: { for: `media-${question.id}` },
      text: 'Add Media (Image or Video)',
    });
    mediaContainer.appendChild(mediaLabel);

    const mediaInput = DOMHelper.createElement('input', {
      attributes: {
        type: 'file',
        id: `media-${question.id}`,
        accept: 'image/*,video/*',
      },
      classes: ['input-field'],
    });

    // Event Listener to Handle File Selection
    mediaInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // Optionally, validate file type and size here
        // For simplicity, we'll assume the file is valid

        // Create a URL for preview
        const fileURL = URL.createObjectURL(file);

        // Update question media reference
        question.media = {
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: fileURL, // In a real application, you'd upload the file and store the URL from the server
          file: file, // Store the File object for uploading
        };

        // Display Preview
        this.displayMediaPreview(mediaContainer, question);
      }
    });

    mediaContainer.appendChild(mediaInput);

    return mediaContainer;
  }

  displayMediaPreview(mediaContainer, question) {
    // Remove existing preview if any
    const existingPreview = mediaContainer.querySelector('.media-preview');
    if (existingPreview) {
      existingPreview.remove();
    }

    if (question.media) {
      const preview = DOMHelper.createElement('div', { classes: ['media-preview'] });

      if (question.media.type === 'image') {
        const img = DOMHelper.createElement('img', {
          attributes: { src: question.media.url, alt: 'Question Image' },
          classes: ['media-image'],
        });
        preview.appendChild(img);
      } else if (question.media.type === 'video') {
        const video = DOMHelper.createElement('video', {
          attributes: { src: question.media.url, controls: true },
          classes: ['media-video'],
        });
        preview.appendChild(video);
      }

      mediaContainer.appendChild(preview);
    }
  }

  validateExam() {
    if (!this.exam.title.trim()) {
      return 'Exam title cannot be empty.';
    }

    if (this.exam.questions.length === 0) {
      return 'At least one question must be added.';
    }

    for (let i = 0; i < this.exam.questions.length; i++) {
      const q = this.exam.questions[i];
      if (!q.prompt.trim()) {
        return `Question ${i + 1} prompt cannot be empty.`;
      }

      // Media validation (optional)
      // For example, you can enforce that only certain types or sizes are allowed

      if (q.type === 'MultipleChoice') {
        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j].trim()) {
            return `Question ${i + 1}, Option ${j + 1} cannot be empty.`;
          }
        }
        if (q.correctOption === null || q.correctOption === undefined) {
          return `Question ${i + 1} must have a correct option selected.`;
        }
      }

      if (q.type === 'Coding') {
        if (!q.initialCode.trim()) {
          return `Question ${i + 1} must have initial code provided.`;
        }
        if (!q.language) {
          return `Question ${i + 1} must have a programming language selected.`;
        }
      }
    }

    return null; // No validation errors
  }

  clearForm(questionsContainer) {
    // Reset Exam
    this.exam = new Exam();

    // Dispose all Monaco Editor instances
    this.monacoEditors.forEach((editor, id) => {
      this.editorService.disposeEditor(id);
    });
    this.monacoEditors.clear();

    // Clear Questions Container
    questionsContainer.innerHTML = '';

    // Reset Exam Title Input
    const titleInput = document.getElementById('exam-title');
    if (titleInput) {
      titleInput.value = '';
    }
  }

  renderSaveExamButton(questionsContainer) { // Removed 'async' keyword
    const saveExamBtn = DOMHelper.createElement('button', {
      classes: ['btn', 'btn-save'],
      text: 'Save Exam',
    });

    // Event Listener for Save Exam
    saveExamBtn.addEventListener('click', async () => { // Handle async within the event
      try {
        // Validate Exam
        const validationError = this.validateExam();
        if (validationError) {
          alert(`Validation Error: ${validationError}`);
          return;
        }

        // Handle media uploads before creating the exam
        await this.handleMediaUploads();

        const data = await ApiService.createExam(this.exam);
        if (data.message) {
          alert('Exam Saved Successfully!');
          // Clear the form
          this.clearForm(questionsContainer);
        } else {
          alert(`Error: ${data.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to save exam. Make sure the backend server is running.');
      }
    });

    return saveExamBtn;
  }

  async handleMediaUploads() {
    const uploadPromises = [];
  
    this.exam.questions.forEach((question) => {
      if (question.media && question.media.file) {
        console.log('Uploading media for question:', question.id, question.media.file);
        const uploadPromise = ApiService.uploadMedia(question.media.file)
          .then((response) => {
            question.media.url = response.url;
            delete question.media.file;
          })
          .catch((err) => {
            console.error(`Failed to upload media for question ${question.id}:`, err);
            throw new Error(`Failed to upload media for question ${question.id}.`);
          });
  
        uploadPromises.push(uploadPromise);
      }
    });
  
    await Promise.all(uploadPromises);
  }
  
  

  updateQuestionNumbers() {
    const questionElements = document.querySelectorAll('.questions-container .question');
    questionElements.forEach((questionDiv, index) => {
      const title = questionDiv.querySelector('.question-title');
      if (title) {
        title.textContent = `Question ${index + 1}`;
      }
    });
  }
}
