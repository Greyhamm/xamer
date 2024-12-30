export default class Button {
    constructor(options = {}) {
      this.element = document.createElement('button');
      this.element.className = `btn ${options.className || ''}`.trim();
      this.element.textContent = options.text || '';
      
      if (options.onClick) {
        this.element.addEventListener('click', options.onClick);
      }
      
      if (options.type) {
        this.element.type = options.type;
      }
      
      if (options.disabled) {
        this.element.disabled = true;
      }
    }
  
    setLoading(isLoading) {
      this.element.disabled = isLoading;
      const originalText = this.element.textContent;
      this.element.textContent = isLoading ? 'Loading...' : originalText;
    }
  
    setDisabled(disabled) {
      this.element.disabled = disabled;
    }
  
    render() {
      return this.element;
    }
  }