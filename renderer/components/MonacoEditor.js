// renderer/components/MonacoEditor.js

export default class MonacoEditorComponent {
  constructor(container, options = {}) {
    if (!window.monaco) {
      console.error('Monaco is not loaded');
      return;
    }
    this.editor = window.monaco.editor.create(container, {
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
