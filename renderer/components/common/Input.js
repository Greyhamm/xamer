/**
 * Represents a flexible input component supporting various input types
 */
export default class Input {
  /**
   * Create a new Input instance
   * @param {Object} options - Configuration options for the input
   * @param {string} [options.type='text'] - Input type (text, email, password, etc.)
   * @param {string} [options.placeholder=''] - Input placeholder text
   * @param {string} [options.value=''] - Initial input value
   * @param {string} [options.name=''] - Input name attribute
   * @param {boolean} [options.required=false] - Whether input is required
   * @param {Function} [options.onChange] - Change event handler
   * @param {boolean} [options.multiline=false] - Use textarea instead of input
   */
  constructor(options = {}) {
    // Create input or textarea element based on multiline flag
    this.element = document.createElement(options.multiline ? 'textarea' : 'input');
    
    // Apply CSS classes
    this.element.className = `form-control ${options.className || ''}`.trim();
    
    // Set input type for single-line inputs
    if (!options.multiline) {
      this.element.type = options.type || 'text';
    }
    
    // Set placeholder
    if (options.placeholder) {
      this.element.placeholder = options.placeholder;
    }
    
    // Set initial value
    if (options.value) {
      this.element.value = options.value;
    }
    
    // Set name attribute
    if (options.name) {
      this.element.name = options.name;
    }
    
    // Set required attribute
    if (options.required) {
      this.element.required = true;
    }
    
    // Attach change event listeners
    if (options.onChange) {
      // Use multiple event types for comprehensive input capture
      ['input', 'change', 'paste'].forEach(eventType => {
        this.element.addEventListener(eventType, (e) => {
          // Prevent default paste to control input
          if (eventType === 'paste') {
            e.preventDefault();
          }
          
          // Stop event propagation
          e.stopPropagation();
          
          // Get current value
          const value = e.target.value;
          
          // Debounce change to prevent excessive calls
          this.debounceChange(options.onChange, value);
        });
      });

      // Additional event listeners for comprehensive input handling
      this.element.addEventListener('keydown', (e) => {
        // Allow standard input keys
        if (e.key.length === 1 || ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.stopPropagation();
        }
      });
    }
  }

  /**
   * Debounce change event to group rapid changes
   * @param {Function} callback - Change handler
   * @param {string} value - Input value
   */
  debounceChange(callback, value) {
    if (this.changeTimeout) {
      clearTimeout(this.changeTimeout);
    }
    
    this.changeTimeout = setTimeout(() => {
      callback(value);
    }, 50);
  }

  /**
   * Get current input value
   * @returns {string} Current input value
   */
  getValue() {
    return this.element.value;
  }

  /**
   * Set input value and trigger change event
   * @param {string} value - New input value
   */
  setValue(value) {
    this.element.value = value;
    
    // Trigger change event manually
    const event = new Event('input', { bubbles: true });
    this.element.dispatchEvent(event);
  }

  /**
   * Set input error state
   * @param {string} error - Error message
   */
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

  /**
   * Focus the input element
   */
  focus() {
    this.element.focus();
  }

  /**
   * Remove focus from input element
   */
  blur() {
    this.element.blur();
  }

  /**
   * Render the input element
   * @returns {HTMLElement} The input DOM element
   */
  render() {
    return this.element;
  }
}