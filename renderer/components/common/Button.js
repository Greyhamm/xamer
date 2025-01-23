/**
 * Represents a customizable button component
 */
export default class Button {
  /**
   * Create a new Button instance
   * @param {Object} options - Configuration options for the button
   * @param {string} [options.text=''] - Button text content
   * @param {string} [options.className=''] - CSS classes for the button
   * @param {Function} [options.onClick] - Click event handler
   * @param {string} [options.type='button'] - Button type (submit, button, etc.)
   * @param {boolean} [options.disabled=false] - Initial disabled state
   */
  constructor(options = {}) {
    // Create button element
    this.element = document.createElement('button');
    
    // Apply CSS classes, trimming whitespace
    this.element.className = `btn ${options.className || ''}`.trim();
    
    // Set button text
    this.element.textContent = options.text || '';
    
    // Add click event listener if provided
    if (options.onClick) {
      this.element.addEventListener('click', options.onClick);
    }
    
    // Set button type
    if (options.type) {
      this.element.type = options.type;
    }
    
    // Set initial disabled state
    if (options.disabled) {
      this.element.disabled = true;
    }
  }

  /**
   * Toggle button loading state
   * @param {boolean} isLoading - Whether the button should show loading state
   */
  setLoading(isLoading) {
    // Disable button and change text when loading
    this.element.disabled = isLoading;
    const originalText = this.element.textContent;
    this.element.textContent = isLoading ? 'Loading...' : originalText;
  }

  /**
   * Programmatically set button disabled state
   * @param {boolean} disabled - Whether the button should be disabled
   */
  setDisabled(disabled) {
    this.element.disabled = disabled;
  }

  /**
   * Return the button DOM element
   * @returns {HTMLButtonElement} The button element
   */
  render() {
    return this.element;
  }
}