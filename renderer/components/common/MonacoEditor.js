export default class MonacoEditor {
  constructor(options = {}) {
    this.options = {
      ...options,
      onChange: this.debouncedOnChange.bind(this)
    };
    this.editor = null;
    this.container = null;
    this.changeTimeout = null;
    this.layoutTimeout = null;
    this.resizeObserver = null;
  }

  debouncedOnChange(value) {
    if (this.changeTimeout) {
      clearTimeout(this.changeTimeout);
    }
    
    this.changeTimeout = setTimeout(() => {
      if (this.options.onChange) {
        this.options.onChange(value);
      }
    }, 300);
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

    // Store container reference
    this.container = container;
    
    // Only dispose if we have an existing editor
    if (this.editor) {
      this.editor.dispose();
    }

    // Reset container
    this.container.innerHTML = '';

    // Create editor with specific configuration
    this.editor = monaco.editor.create(this.container, {
      value: this.options.value || '',
      language: this.options.language || 'javascript',
      theme: 'vs-dark',
      automaticLayout: false, // Changed to false as we'll handle layout
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

    // Setup resize handling
    this.setupResizeHandling();

    // Add change listener
    this.editor.onDidChangeModelContent(() => {
      const value = this.editor.getValue();
      this.debouncedOnChange(value);
    });

    // Force initial layout
    this.updateLayout();
  }

  setupResizeHandling() {
    // Clean up existing observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Create new observer
    this.resizeObserver = new ResizeObserver(() => {
      this.updateLayout();
    });

    if (this.container) {
      this.resizeObserver.observe(this.container);
    }

    // Also watch for window resize
    window.addEventListener('resize', this.updateLayout.bind(this));
  }

  updateLayout() {
    if (!this.editor || !this.container) return;

    // Clear any pending layout timeout
    if (this.layoutTimeout) {
      clearTimeout(this.layoutTimeout);
    }

    // Schedule a new layout update
    this.layoutTimeout = setTimeout(() => {
      if (this.editor) {
        // Ensure container has dimensions
        if (this.container.clientHeight === 0) {
          this.container.style.height = '300px';
        }
        
        // Force editor layout update
        this.editor.layout();

        // Force Monaco to refresh its viewport
        this.editor.render(true);
      }
    }, 10);
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
    window.removeEventListener('resize', this.updateLayout.bind(this));

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