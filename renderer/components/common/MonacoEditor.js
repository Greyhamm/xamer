export default class MonacoEditor {
  constructor(options = {}) {
    this.options = {
      ...options,
      onChange: this.debouncedOnChange.bind(this)
    };
    this.editor = null;
    this.container = null;
    this.changeTimeout = null;
  }

  // Debounced onChange to prevent excessive calls
  debouncedOnChange(value) {
    if (this.changeTimeout) {
      clearTimeout(this.changeTimeout);
    }
    
    this.changeTimeout = setTimeout(() => {
      if (this.options.onChange) {
        this.options.onChange(value);
      }
    }, 300); // Adjust delay as needed
  }

  mount(container) {
    // Extensive error checking
    if (!window.monaco) {
      console.error('Monaco Editor not loaded');
      return;
    }
  
    if (!container || !(container instanceof Element)) {
      console.error('Invalid container element');
      return;
    }
  
    // Comprehensive cleanup
    try {
      if (this.editor) {
        this.editor.dispose();
      }
    } catch (disposeError) {
      console.warn('Error disposing previous editor:', disposeError);
    }
  
    // Reset container
    this.container = container;
    this.container.innerHTML = '';
  
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
    this.editor = monaco.editor.create(this.container, {
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
      fixedOverflowWidgets: true,
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        useShadows: false
      },
      overviewRulerLanes: 0,
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true
    });

    // Add change listener with debounce
    this.editor.onDidChangeModelContent(() => {
      const value = this.editor.getValue();
      this.debouncedOnChange(value);
    });

    // Setup resize handling
    this.setupResizeHandling();
  }

  updateLayout = () => {
    if (!this.editor || !this.container) return;

    // Clear any pending layout timeout
    if (this.layoutTimeout) {
      clearTimeout(this.layoutTimeout);
    }

    // Schedule a new layout update
    this.layoutTimeout = setTimeout(() => {
      if (this.editor) {
        this.editor.layout();
      }
    }, 10);
  }

  setupResizeHandling() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.updateLayout();
    });

    if (this.container) {
      this.resizeObserver.observe(this.container);
    }

    window.addEventListener('resize', this.updateLayout);
  }

  getValue() {
    return this.editor ? this.editor.getValue() : '';
  }

  setValue(value) {
    if (this.editor) {
      this.editor.setValue(value || '');
      this.updateLayout();
    }
  }

  dispose() {
    window.removeEventListener('resize', this.updateLayout);

    if (this.layoutTimeout) {
      clearTimeout(this.layoutTimeout);
    }

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