export default class MonacoEditor {
  constructor(options = {}) {
    this.options = options;
    this.editor = null;
    this.container = null;
    this.resizeObserver = null;
  }

  mount(container) {
    if (!window.monaco) {
      console.error('Monaco Editor not loaded');
      return;
    }

    if (!container || !(container instanceof Element)) {
      console.error('Invalid container element');
      return;
    }

    // Don't create a new editor if one already exists for this container
    if (this.editor) {
      console.warn('Editor already mounted');
      return;
    }

    this.container = container;

    // Define theme directly
    monaco.editor.defineTheme('examTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2d2d2d',
        'editorCursor.foreground': '#ffffff',
        'editor.selectionBackground': '#264f78'
      }
    });

    // Set the theme
    monaco.editor.setTheme('examTheme');

    // Create editor with specific configuration
    const editorConfig = {
      value: this.options.value || '',
      language: this.options.language || 'javascript',
      theme: 'examTheme',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      readOnly: this.options.readOnly || false,
      fontSize: 14,
      wordWrap: 'on',
      formatOnType: true,
      formatOnPaste: true,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      folding: true,
      renderWhitespace: 'selection',
      dragAndDrop: true,
      links: true,
      contextmenu: true
    };

    // Create editor
    this.editor = monaco.editor.create(this.container, editorConfig);

    // Force immediate layout update
    requestAnimationFrame(() => {
      if (this.editor) {
        this.editor.layout();
      }
    });

    // Add change listener if provided
    if (this.options.onChange) {
      this.editor.onDidChangeModelContent(() => {
        this.options.onChange(this.editor.getValue());
      });
    }

    // Setup resize handling
    this.setupResizeHandling();
  }

  setupResizeHandling() {
    // Remove any existing observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Create new resize observer
    this.resizeObserver = new ResizeObserver(() => {
      if (this.editor) {
        this.editor.layout();
      }
    });

    if (this.container) {
      this.resizeObserver.observe(this.container);
    }

    // Add window resize handler
    window.addEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    if (this.editor) {
      requestAnimationFrame(() => {
        this.editor.layout();
      });
    }
  }

  getValue() {
    return this.editor ? this.editor.getValue() : '';
  }

  setValue(value) {
    if (this.editor) {
      this.editor.setValue(value || '');
    }
  }

  dispose() {
    window.removeEventListener('resize', this.handleResize);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.editor) {
      this.editor.dispose();
      this.editor = null;
    }

    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
  }
}