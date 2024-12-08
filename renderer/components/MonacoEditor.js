// renderer/components/MonacoEditor.js

export default class MonacoEditorComponent {
    constructor(container, options = {}) {
      this.editor = monaco.editor.create(container, {
        value: options.value || '',
        language: options.language || 'javascript',
        theme: 'vs-dark',
        automaticLayout: true,
      });
    }
  
    getValue() {
      return this.editor.getValue();
    }
  
    setValue(value) {
      this.editor.setValue(value);
    }
  
    dispose() {
      this.editor.dispose();
    }
  }
  