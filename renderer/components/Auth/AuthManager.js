import LoginForm from './LoginForm.js';
import SignupForm from './SignupForm.js';
import DOMHelper from '../../services/utils/DOMHelper.js';

/**
 * Manages the authentication user interface
 * Handles switching between login and signup forms
 */
export default class AuthManager {
  constructor() {
    // Track the current form being displayed
    this.currentForm = 'login';
  }

  /**
   * Switch between login and signup forms
   * @param {string} formType - The type of form to switch to ('login' or 'signup')
   * @returns {HTMLElement} The rendered form container
   */
  switchForm(formType) {
    this.currentForm = formType;
    return this.render();
  }

  /**
   * Render the appropriate authentication form
   * @returns {HTMLElement} The container with the current authentication form
   */
  render() {
    const container = DOMHelper.createElement('div', {
      classes: ['auth-container']
    });

    if (this.currentForm === 'login') {
      // Create login form with a function to switch to signup
      const loginForm = new LoginForm(() => {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '';
        mainContent.appendChild(this.switchForm('signup'));
      });
      container.appendChild(loginForm.render());
    } else {
      // Create signup form with a function to switch to login
      const signupForm = new SignupForm(() => {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '';
        mainContent.appendChild(this.switchForm('login'));
      });
      container.appendChild(signupForm.render());
    }

    return container;
  }
}