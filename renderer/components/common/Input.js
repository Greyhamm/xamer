export default class Input {
  constructor(options = {}) {
    this.element = document.createElement(options.multiline ? 'textarea' : 'input');
    this.element.className = `form-control ${options.className || ''}`.trim();
    
    if (!options.multiline) {
      this.element.type = options.type || 'text';
    }
    
    if (options.placeholder) {
      this.element.placeholder = options.placeholder;
    }
    
    if (options.value) {
      this.element.value = options.value;
    }
    
    if (options.name) {
      this.element.name = options.name;
    }
    
    if (options.required) {
      this.element.required = true;
    }
    
    // Comprehensive event handling
    if (options.onChange) {
      // Use multiple event listeners to ensure comprehensive input capture
      ['input', 'change', 'paste'].forEach(eventType => {
        this.element.addEventListener(eventType, (e) => {
          // Prevent default only if necessary
          if (eventType === 'paste') {
            e.preventDefault();
          }
          
          // Stop propagation to prevent event bubbling
          e.stopPropagation();
          
          // Get the current value
          const value = e.target.value;
          
          // Debounce the onChange to prevent excessive calls
          this.debounceChange(options.onChange, value);
        });
      });

      // Additional event listeners to ensure full input capture
      this.element.addEventListener('keydown', (e) => {
        // Allow all standard input
        if (e.key.length === 1 || ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.stopPropagation();
        }
      });
    }

    // Prevent default behaviors that might interfere with input
    this.element.addEventListener('focus', (e) => {
      e.stopPropagation();
      this.element.style.outline = 'none';
    });
  }

  // Debounce method to prevent excessive calls
  debounceChange(callback, value) {
    if (this.changeTimeout) {
      clearTimeout(this.changeTimeout);
    }
    
    this.changeTimeout = setTimeout(() => {
      callback(value);
    }, 50); // Small delay to group rapid changes
  }

  getValue() {
    return this.element.value;
  }

  setValue(value) {
    this.element.value = value;
    
    // Trigger change event manually
    const event = new Event('input', { bubbles: true });
    this.element.dispatchEvent(event);
  }

  setError(error) {
    this.element.classList.toggle('error', Boolean(error));
    if (error) {
      this.element.setAttribute('aria-invalid', 'true');
      this.element.setAttribute('aria-errormessage', error);
    } else {
      this.element.removeAttribute('aria-invalid');
      this.element.removeAttribute('aria-errormessage');
    }
  }

  focus() {
    this.element.focus();
  }

  blur() {
    this.element.blur();
  }

  render() {
    return this.element;
  }
}