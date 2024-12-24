// renderer/components/Auth/LoginForm.js
import DOMHelper from '../../helpers/DOMHelper.js';

export default class LoginForm {
    constructor(onSwitchToSignup) {
      this.state = {
        email: '',
        password: '',
        loading: false
      };
      this.onSwitchToSignup = onSwitchToSignup;
    }
  
    render() {
      const container = DOMHelper.createElement('div', {
        classes: ['auth-container']
      });
  
      const form = DOMHelper.createElement('form', {
        classes: ['auth-form']
      });
  
      // Form fields
      const emailGroup = this.createFormGroup('email', 'Email', 'email');
      const passwordGroup = this.createFormGroup('password', 'Password', 'password');
  
      // Submit button
      const submitButton = DOMHelper.createElement('button', {
        attributes: { type: 'submit' },
        classes: ['btn', 'btn-primary'],
        text: 'Login'
      });
  
      // Switch to signup link
      const switchText = DOMHelper.createElement('p', {
        classes: ['auth-switch'],
        html: "Don't have an account? <a href='#' id='switch-to-signup'>Sign up</a>"
      });
  
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (this.state.loading) return;
  
        this.state.loading = true;
        submitButton.textContent = 'Logging in...';
        submitButton.disabled = true;
  
        try {
          const response = await window.api.login({
            email: this.state.email,
            password: this.state.password
          });
  
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
          
          // Reload page to reinitialize app
          window.location.reload();
        } catch (error) {
          console.error('Login error:', error);
          alert(error.message || 'Failed to login');
        } finally {
          this.state.loading = false;
          submitButton.textContent = 'Login';
          submitButton.disabled = false;
        }
      });
  
      const switchLink = switchText.querySelector('#switch-to-signup');
      switchLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.onSwitchToSignup) {
          this.onSwitchToSignup();
        }
      });
  
      // Assemble form
      form.appendChild(emailGroup);
      form.appendChild(passwordGroup);
      form.appendChild(submitButton);
      form.appendChild(switchText);
      container.appendChild(form);
  
      return container;
    }
  
    createFormGroup(id, label, type) {
      const group = DOMHelper.createElement('div', {
        classes: ['form-group']
      });
  
      const labelElement = DOMHelper.createElement('label', {
        attributes: { for: id },
        text: label
      });
  
      const input = DOMHelper.createElement('input', {
        attributes: {
          type: type,
          id: id,
          required: true
        },
        classes: ['form-control']
      });
  
      input.addEventListener('input', (e) => {
        this.state[id] = e.target.value;
      });
  
      group.appendChild(labelElement);
      group.appendChild(input);
      return group;
    }
  }