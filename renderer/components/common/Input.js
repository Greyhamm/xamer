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
      
      if (options.onChange) {
        this.element.addEventListener('input', (e) => options.onChange(e.target.value));
      }
    }
  
    getValue() {
      return this.element.value;
    }
  
    setValue(value) {
      this.element.value = value;
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
  
    render() {
      return this.element;
    }
  }