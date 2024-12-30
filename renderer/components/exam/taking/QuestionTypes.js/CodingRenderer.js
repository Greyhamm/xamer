import BaseQuestionRenderer from './BaseQuestionRenderer.js';
import MonacoEditor from '../../../common/MonacoEditor.js';

export default class CodingRenderer extends BaseQuestionRenderer {
  constructor(question, options = {}) {
    super(question, options);
    this.editor = null;
    this.executionResult = null;
    this.isExecuting = false;
  }

  validate() {
    return this.answer?.trim().length > 0;
  }

  getValue() {
    return {
      questionType: 'Coding',
      answer: this.answer,
      language: this.question.language
    };
  }

  async executeCode() {
    if (this.isExecuting) return;

    try {
      this.isExecuting = true;
      this.updateExecutionUI('Executing...');
      this.executeButton.disabled = true;

      const code = this.editor.getValue();
      const response = await window.api[`execute${this.question.language}`](code);

      this.executionResult = response;
      this.updateExecutionUI(this.formatExecutionResult(response));
    } catch (error) {
      this.updateExecutionUI(`Error: ${error.message}`, true);
    } finally {
      this.isExecuting = false;
      this.executeButton.disabled = false;
    }
  }

  formatExecutionResult(result) {
    if (!result) return 'No output';

    let output = '';
    if (result.logs && result.logs.length > 0) {
      output += result.logs.join('\n');
    }
    if (result.result) {
      if (output) output += '\n';
      output += result.result;
    }
    return output || 'No output';
  }

  updateExecutionUI(message, isError = false) {
    if (this.outputContainer) {
      this.outputContainer.textContent = message;
      this.outputContainer.className = `code-output ${isError ? 'error' : ''}`;
    }
  }

  render() {
    const container = super.render();
    container.className += ' coding-question';

    // Editor container
    const editorContainer = document.createElement('div');
    editorContainer.className = 'monaco-editor-container';

    // Initialize Monaco Editor
    this.editor = new MonacoEditor({
      language: this.question.language,
      value: this.answer || this.question.initialCode || '',
      readOnly: false,
      onChange: (value) => {
        this.answer = value;
        this.setState(this.getValue());
      }
    });

    // Execution controls
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'coding-controls';

    this.executeButton = document.createElement('button');
    this.executeButton.className = 'btn btn-primary';
    this.executeButton.textContent = 'Run Code';
    this.executeButton.addEventListener('click', () => this.executeCode());

    // Output display
    this.outputContainer = document.createElement('pre');
    this.outputContainer.className = 'code-output';

    controlsContainer.appendChild(this.executeButton);
    container.appendChild(editorContainer);
    container.appendChild(controlsContainer);
    container.appendChild(this.outputContainer);

    // Initialize editor after container is in DOM
    setTimeout(() => {
      this.editor.mount(editorContainer);
    }, 0);

    return container;
  }

  destroy() {
    if (this.editor) {
      this.editor.dispose();
    }
  }
}