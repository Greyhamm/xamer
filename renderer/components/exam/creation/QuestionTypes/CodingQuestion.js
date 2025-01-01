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
  }

  getQuestionData() {
    return {
      type: this.type,
      prompt: this.state.prompt,
      language: this.state.language,
      initialCode: this.state.initialCode, // Ensure this is captured from editor
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
      // Clean up old editor before creating new one
      if (this.editor) {
        this.editor.dispose();
        this.editor = null;
      }
      this.setState({ 
        language: e.target.value,
        initialCode: this.getDefaultInitialCodeForLanguage(e.target.value)
      });
      this.initializeEditor();
    });

    container.appendChild(languageSelect);

    // Editor container
    this.editorContainer = document.createElement('div');
    this.editorContainer.className = 'monaco-editor-container';
    this.editorContainer.style.height = '300px';
    this.editorContainer.style.border = '1px solid #ccc';
    this.editorContainer.style.marginTop = '1rem';
    container.appendChild(this.editorContainer);

    // Initialize editor after container is in DOM
    requestAnimationFrame(() => {
      this.initializeEditor();
    });

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

  initializeEditor() {
    // Ensure clean slate and prevent memory leaks
    if (this.editor) {
      try {
        this.editor.dispose();
      } catch (error) {
        console.warn('Error disposing previous editor:', error);
      }
      this.editor = null;
    }
  
    // Ensure container exists and is clean
    if (!this.editorContainer) return;
    this.editorContainer.innerHTML = '';
  
    // Create new editor with robust error handling
    try {
      this.editor = new MonacoEditor({
        language: this.state.language,
        value: this.state.initialCode || this.getDefaultInitialCodeForLanguage(this.state.language),
        onChange: (value) => {
          // Update initialCode state when editor content changes
          requestAnimationFrame(() => {
            this.setState({ initialCode: value });
          });
        },
        readOnly: false
      });
  
      // Mount with error handling
      requestAnimationFrame(() => {
        if (this.editorContainer) {
          try {
            this.editor.mount(this.editorContainer);
          } catch (mountError) {
            console.error('Error mounting editor:', mountError);
          }
        }
      });
    } catch (editorError) {
      console.error('Error creating Monaco Editor:', editorError);
    }
  }
  
  dispose() {
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
  }
}