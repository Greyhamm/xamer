import BaseQuestion from './BaseQuestion.js';
import MonacoEditor from '../../../common/MonacoEditor.js';

export default class CodingQuestion extends BaseQuestion {
  constructor(options = {}) {
    super(options);
    this.type = 'Coding';
    this.state = {
      ...this.state,
      language: options.language || 'javascript',
      initialCode: options.initialCode || '',
      testCases: options.testCases || [],
    };
    this.editor = null;
    this.editorContainer = null;
    this.isEditorInitialized = false;
  }

  getQuestionData() {
    return {
      type: this.type,
      prompt: this.state.prompt,
      language: this.state.language,
      initialCode: this.editor ? this.editor.getValue() : this.state.initialCode,
      media: this.state.media
    };
  }

  render() {
    const container = super.createQuestionContainer();

    // Language selection
    const languageSelect = document.createElement('select');
    languageSelect.className = 'form-control';
    languageSelect.innerHTML = `
      <option value="javascript">JavaScript</option>
      <option value="python">Python</option>
      <option value="java">Java</option>
    `;
    languageSelect.value = this.state.language;
    languageSelect.addEventListener('change', (e) => {
      const newLanguage = e.target.value;
      if (newLanguage !== this.state.language) {
        const currentCode = this.editor ? this.editor.getValue() : '';
        this.setState({ 
          language: newLanguage,
          initialCode: currentCode || this.getDefaultInitialCodeForLanguage(newLanguage)
        });
        this.reinitializeEditor();
      }
    });

    container.appendChild(languageSelect);

    // Create editor container with explicit dimensions
    this.editorContainer = document.createElement('div');
    this.editorContainer.className = 'monaco-editor-container';
    Object.assign(this.editorContainer.style, {
      height: '300px',
      width: '100%',
      border: '1px solid #ccc',
      marginTop: '1rem',
      position: 'relative',
      overflow: 'hidden'
    });
    container.appendChild(this.editorContainer);

    // Initialize editor after container is in DOM
    if (!this.isEditorInitialized) {
      requestAnimationFrame(() => {
        this.initializeEditor();
      });
    }

    return container;
  }

  getDefaultInitialCodeForLanguage(language) {
    const defaults = {
      'javascript': '// Write your JavaScript code here\n',
      'python': '# Write your Python code here\n',
      'java': '// Write your Java code here\n'
    };
    return defaults[language] || '';
  }

  reinitializeEditor() {
    if (this.editor) {
      const currentValue = this.editor.getValue();
      this.editor.dispose();
      this.editor = null;
      this.isEditorInitialized = false;
      // Add a small delay before reinitializing
      setTimeout(() => {
        this.initializeEditor(currentValue);
      }, 50);
    }
  }

  initializeEditor(preservedValue) {
    if (this.isEditorInitialized || !this.editorContainer) return;

    try {
      if (!this.editor) {
        this.editor = new MonacoEditor({
          language: this.state.language,
          value: preservedValue || this.state.initialCode || this.getDefaultInitialCodeForLanguage(this.state.language),
          onChange: (value) => {
            this.state.initialCode = value;
          },
          readOnly: false
        });
      }

      if (this.editorContainer) {
        this.editor.mount(this.editorContainer);
        this.isEditorInitialized = true;
      }
    } catch (error) {
      console.error('Error initializing Monaco Editor:', error);
    }
  }
  
  dispose() {
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
      this.isEditorInitialized = false;
    }
  }
}