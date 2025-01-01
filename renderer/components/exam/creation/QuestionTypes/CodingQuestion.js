import BaseQuestion from './BaseQuestion.js';
import MonacoEditor from '../../../common/MonacoEditor.js';
import Button from '../../../common/Button.js';

export default class CodingQuestion extends BaseQuestion {
  constructor(options = {}) {
    super(options);
    this.type = 'Coding';
    this.state = {
      ...this.state,
      language: options.language || 'javascript',
      initialCode: options.initialCode || '',
      testCases: options.testCases || [],
      executionResult: null
    };
    this.editor = null;
    this.editorContainer = null;
  }

  async executeCode() {
    try {
      const code = this.editor.getValue();
      const response = await window.api[`execute${this.state.language}`](code);
      this.setState({ executionResult: response });
    } catch (error) {
      this.setState({ error: error.message });
    }
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
      this.setState({ language: e.target.value });
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

    // Execute button
    const executeButton = new Button({
      text: 'Run Code',
      className: 'btn-primary',
      onClick: () => this.executeCode()
    });
    container.appendChild(executeButton.render());

    // Output container
    const outputContainer = document.createElement('pre');
    outputContainer.className = 'code-output';
    if (this.state.executionResult) {
      outputContainer.textContent = JSON.stringify(this.state.executionResult, null, 2);
    }
    container.appendChild(outputContainer);

    // Initialize editor after container is in DOM
    requestAnimationFrame(() => {
      this.initializeEditor();
    });

    return container;
  }

  initializeEditor() {
    // Don't initialize if we already have an editor
    if (this.editor || !this.editorContainer) {
      return;
    }

    // Clear any existing content
    this.editorContainer.innerHTML = '';

    this.editor = new MonacoEditor({
      language: this.state.language,
      value: this.state.initialCode,
      onChange: (value) => {
        this.setState({ initialCode: value });
      }
    });
    this.editor.mount(this.editorContainer);
  }

  dispose() {
    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }
  }
}