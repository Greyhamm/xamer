// renderer/components/Auth/AuthManager.js
import LoginForm from './LoginForm.js';
import SignupForm from './SignupForm.js';
import DOMHelper from '../../services/utils/DOMHelper.js';

export default class AuthManager {
  constructor() {
    this.currentForm = 'login';
  }

  switchForm(formType) {
    this.currentForm = formType;
    return this.render();
  }

  render() {
    const container = DOMHelper.createElement('div', {
      classes: ['auth-container']
    });

    if (this.currentForm === 'login') {
      const loginForm = new LoginForm(() => {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '';
        mainContent.appendChild(this.switchForm('signup'));
      });
      container.appendChild(loginForm.render());
    } else {
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