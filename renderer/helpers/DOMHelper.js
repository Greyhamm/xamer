// renderer/helpers/DOMHelper.js
export default class DOMHelper {
    static createElement(tag, options = {}) {
      const element = document.createElement(tag);
  
      // Set attributes
      if (options.attributes) {
        Object.keys(options.attributes).forEach((attr) => {
          element.setAttribute(attr, options.attributes[attr]);
        });
      }
  
      // Set classes
      if (options.classes) {
        element.className = options.classes.join(' ');
      }
  
      // Set text content
      if (options.text) {
        element.textContent = options.text;
      }
  
      // Set inner HTML
      if (options.html) {
        element.innerHTML = options.html;
      }
  
      // Append children
      if (options.children && Array.isArray(options.children)) {
        options.children.forEach((child) => {
          element.appendChild(child);
        });
      }
  
      return element;
    }
  
    static appendChildren(parent, children) {
      children.forEach((child) => {
        parent.appendChild(child);
      });
    }
  }
  