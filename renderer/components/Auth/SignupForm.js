// renderer/components/Auth/SignupForm.js
import DOMHelper from '../../helpers/DOMHelper.js';

export default class SignupForm {
  constructor(onSwitchToLogin) {
    this.state = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
      loading: false,
      error: null
    };
    this.onSwitchToLogin = onSwitchToLogin;
  }

  validateForm() {
    const errors = [];

    if (!this.state.username.trim()) {
      errors.push('Username is required');
    }

    if (!this.state.email.trim()) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(this.state.email)) {
      errors.push('Email is invalid');
    }

    if (!this.state.password) {
      errors.push('Password is required');
    } else if (this.state.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (this.state.password !== this.state.confirmPassword) {
      errors.push('Passwords do not match');
    }

    return errors;
  }

  render() {
    const form = DOMHelper.createElement('form', {
      classes: ['auth-form']
    });

    // Form Header
    const header = DOMHelper.createElement('div', {
      classes: ['auth-header']
    });

    const title = DOMHelper.createElement('h2', {
      classes: ['auth-title'],
      text: 'Create Account'
    });

    const subtitle = DOMHelper.createElement('p', {
      classes: ['auth-subtitle'],
      text: 'Please fill in your information'
    });

    header.appendChild(title);
    header.appendChild(subtitle);

    // Error Container
    const errorContainer = DOMHelper.createElement('div', {
      classes: ['auth-error'],
      attributes: { id: 'error-container' }
    });

    // Form Fields
    const usernameGroup = this.createFormGroup('username', 'Username', 'text');
    const emailGroup = this.createFormGroup('email', 'Email', 'email');
    const passwordGroup = this.createFormGroup('password', 'Password', 'password');
    const confirmPasswordGroup = this.createFormGroup('confirmPassword', 'Confirm Password', 'password');
    const roleGroup = this.createRoleSelect();

    // Submit Button
    const submitButton = DOMHelper.createElement('button', {
      attributes: { type: 'submit' },
      classes: ['btn', 'btn-primary', 'btn-block'],
      text: 'Sign Up'
    });

    // Login Link
    const switchText = DOMHelper.createElement('p', {
      classes: ['auth-switch']
    });

    const switchLink = DOMHelper.createElement('a', {
      attributes: { href: '#' },
      text: 'Login here'
    });

    switchText.appendChild(document.createTextNode('Already have an account? '));
    switchText.appendChild(switchLink);

    // Event Listeners
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (this.state.loading) return;

      // Clear previous errors
      errorContainer.innerHTML = '';

      // Validate form
      const errors = this.validateForm();
      if (errors.length > 0) {
        errorContainer.innerHTML = errors.map(error => 
          `<div class="error-message">${error}</div>`
        ).join('');
        return;
      }

      this.state.loading = true;
      submitButton.textContent = 'Creating account...';
      submitButton.disabled = true;

      try {
        const response = await window.api.signup({
          username: this.state.username,
          email: this.state.email,
          password: this.state.password,
          role: this.state.role
        });

        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        window.location.reload();
      } catch (error) {
        errorContainer.innerHTML = `
          <div class="error-message">
            ${error.message || 'An error occurred during signup'}
          </div>
        `;
      } finally {
        this.state.loading = false;
        submitButton.textContent = 'Sign Up';
        submitButton.disabled = false;
      }
    });

    switchLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof this.onSwitchToLogin === 'function') {
        this.onSwitchToLogin();
      }
    });

    // Assemble Form
    form.appendChild(header);
    form.appendChild(errorContainer);
    form.appendChild(usernameGroup);
    form.appendChild(emailGroup);
    form.appendChild(passwordGroup);
    form.appendChild(confirmPasswordGroup);
    form.appendChild(roleGroup);
    form.appendChild(submitButton);
    form.appendChild(switchText);

    return form;
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
        name: id,
        required: 'true',
        placeholder: `Enter your ${label.toLowerCase()}`
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

  createRoleSelect() {
    const group = DOMHelper.createElement('div', {
      classes: ['form-group']
    });

    const label = DOMHelper.createElement('label', {
      attributes: { for: 'role' },
      text: 'Role'
    });

    const select = DOMHelper.createElement('select', {
      attributes: {
        id: 'role',
        name: 'role',
        required: 'true'
      },
      classes: ['form-control']
    });

    const options = [
      { value: 'student', text: 'Student' },
      { value: 'teacher', text: 'Teacher' }
    ];

    options.forEach(option => {
      const optionElement = DOMHelper.createElement('option', {
        attributes: { value: option.value },
        text: option.text
      });
      select.appendChild(optionElement);
    });

    select.addEventListener('change', (e) => {
      this.state.role = e.target.value;
    });

    group.appendChild(label);
    group.appendChild(select);

    return group;
  }
}