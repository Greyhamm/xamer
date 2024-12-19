// renderer/services/EditorService.js
export default class EditorService {
    constructor() {
      this.editors = new Map(); // Stores editor instances with unique IDs
    }
  
    /**
     * Creates a Monaco Editor instance.
     * @param {HTMLElement} container - The DOM container for the editor.
     * @param {Object} options - Editor configuration options.
     * @param {string} options.language - Programming language.
     * @param {string} options.value - Initial code value.
     * @param {Function} options.onChange - Callback for content changes.
     * @param {string} editorId - Unique identifier for the editor.
     * @returns {monaco.editor.IStandaloneCodeEditor} The Monaco Editor instance.
     */
    createEditor(container, { language, value, onChange }, editorId) {
      if (!window.monaco) {
        throw new Error('Monaco Editor is not loaded.');
      }
  
      const editor = window.monaco.editor.create(container, {
        value: value || '',
        language: language || 'javascript',
        theme: 'vs-dark',
        automaticLayout: true,
        fontFamily: 'Consolas, "Courier New", monospace', // Reliable monospace fonts
        fontSize: 14, // Adjust as needed
        minimap: { enabled: false }, // Optional: Disable minimap for cleaner UI
        lineNumbers: 'on',
        wordWrap: 'on',
      });
  
      // Listen for changes and invoke callback
      editor.onDidChangeModelContent(() => {
        if (onChange) onChange(editor.getValue());
      });
  
      // Register basic IntelliSense
      this.registerBasicIntelliSense(language, editor);
  
      // Store the editor instance
      if (editorId) {
        this.editors.set(editorId, editor);
      }
  
      return editor;
    }
  
    /**
     * Registers basic IntelliSense for supported languages.
     * @param {string} language - The programming language.
     * @param {monaco.editor.IStandaloneCodeEditor} editor - The Monaco Editor instance.
     */
    registerBasicIntelliSense(language, editor) {
      if (language === 'python') {
        window.monaco.languages.registerCompletionItemProvider('python', {
          provideCompletionItems: () => {
            const suggestions = [
              {
                label: 'def',
                kind: window.monaco.languages.CompletionItemKind.Keyword,
                insertText: 'def ',
              },
              {
                label: 'import',
                kind: window.monaco.languages.CompletionItemKind.Keyword,
                insertText: 'import ',
              },
              {
                label: 'class',
                kind: window.monaco.languages.CompletionItemKind.Keyword,
                insertText: 'class ',
              },
              {
                label: 'for',
                kind: window.monaco.languages.CompletionItemKind.Keyword,
                insertText: 'for ',
              },
              {
                label: 'while',
                kind: window.monaco.languages.CompletionItemKind.Keyword,
                insertText: 'while ',
              },
              // Add more Python keywords and snippets as needed
            ];
            return { suggestions: suggestions };
          },
        });
      }
  
      if (language === 'java') {
        window.monaco.languages.registerCompletionItemProvider('java', {
          provideCompletionItems: () => {
            const suggestions = [
              {
                label: 'public',
                kind: window.monaco.languages.CompletionItemKind.Keyword,
                insertText: 'public ',
              },
              {
                label: 'private',
                kind: window.monaco.languages.CompletionItemKind.Keyword,
                insertText: 'private ',
              },
              {
                label: 'class',
                kind: window.monaco.languages.CompletionItemKind.Keyword,
                insertText: 'class ',
              },
              {
                label: 'for',
                kind: window.monaco.languages.CompletionItemKind.Keyword,
                insertText: 'for ',
              },
              {
                label: 'while',
                kind: window.monaco.languages.CompletionItemKind.Keyword,
                insertText: 'while ',
              },
              // Add more Java keywords and snippets as needed
            ];
            return { suggestions: suggestions };
          },
        });
      }
  
      // Add additional languages as needed
    }
  
  /**
   * Updates the language of an existing Monaco Editor instance.
   * @param {string} editorId - The unique ID of the editor.
   * @param {string} newLanguage - The new programming language.
   */
  updateEditorLanguage(editorId, newLanguage) {
    const editor = this.editors.get(editorId);
    if (editor) {
      window.monaco.editor.setModelLanguage(editor.getModel(), newLanguage);
      // Register new IntelliSense if switching languages
      this.registerBasicIntelliSense(newLanguage, editor);
    }
  }

  /**
   * Disposes of a Monaco Editor instance.
   * @param {string} editorId - The unique ID of the editor to dispose.
   */
  disposeEditor(editorId) {
    const editor = this.editors.get(editorId);
    if (editor) {
      editor.dispose();
      this.editors.delete(editorId);
    }
  }
}
  