import BaseQuestionRenderer from './BaseQuestionRenderer.js';
import MonacoEditor from '../../../common/MonacoEditor.js';

export default class CodingRenderer extends BaseQuestionRenderer {
  constructor(question, options = {}) {
    super(question, options);
    this.editor = null;
    // Initialize answer without triggering state update
    this.answer = options.initialAnswer?.answer || 
                  options.initialAnswer?.selectedOption || 
                  this.question.initialCode || 
                  '';
  }

  validate() {
    const currentValue = this.editor ? this.editor.getValue() : this.answer;
    return currentValue && currentValue.trim().length > 0;
  }

  getValue() {
    const currentValue = this.editor ? this.editor.getValue() : this.answer;
    return {
      questionId: this.question._id,
      questionType: 'Coding',
      answer: currentValue,
      language: this.question.language
    };
  }

  render() {
    const container = super.render();
    container.className += ' coding-question';

    const languageInfo = document.createElement('div');
    languageInfo.className = 'language-info';
    languageInfo.textContent = `Language: ${this.question.language}`;
    container.appendChild(languageInfo);

    const editorContainer = document.createElement('div');
    editorContainer.className = 'monaco-editor-container';
    editorContainer.style.height = '300px';
    editorContainer.style.width = '100%';
    editorContainer.style.border = '1px solid #ccc';
    editorContainer.style.marginTop = '1rem';
    container.appendChild(editorContainer);

    // Initialize editor after container is in DOM
    setTimeout(() => {
      if (!this.editor && editorContainer.isConnected) {
        this.editor = new MonacoEditor({
          language: this.question.language,
          value: this.answer,
          onChange: (value) => {
            if (value !== this.answer) {  // Only update if value changed
              this.answer = value;
              this.setState(this.getValue());
            }
          }
        });
        this.editor.mount(editorContainer);
      }
    }, 0);

    return container;
  }

  dispose() {
    if (this.editor) {
      this.answer = this.editor.getValue();
      this.editor.dispose();
      this.editor = null;
    }
  }
}