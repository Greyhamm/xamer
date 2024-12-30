import Button from '../common/Button.js';
import Input from '../common/Input.js';
import UserState from '../../services/state/UserState.js';

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

    if (this.state.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    if (this.state.password !== this.state.confirmPassword) {
      errors.push('Passwords do not match');
    }

    return errors;
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (this.state.loading) return;

    const errors = this.validateForm();
    if (errors.length > 0) {
      this.setState({ error: errors.join('\n') });
      return;
    }

    // Add this line to log the current role
    console.log('Submitting with role:', this.state.role);

    this.setState({ loading: true, error: null });
    this.submitButton.setLoading(true);

    try {
      const result = await UserState.signup({
        username: this.state.username,
        email: this.state.email,
        password: this.state.password,
        role: this.state.role // Ensure 'role' is included
      });

      if (!result) {
        throw new Error('Signup failed - please try again');
      }

    } catch (error) {
      this.setState({ 
        error: error.message || 'Server error - please try again later'
      });
    } finally {
      this.setState({ loading: false });
      this.submitButton.setLoading(false);
    }
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.updateUI();
  }

  updateUI() {
    if (this.errorElement) {
      this.errorElement.style.display = this.state.error ? 'block' : 'none';
      if (this.state.error) {
        this.errorElement.textContent = this.state.error;
      }
    }
  }

  render() {
    const container = document.createElement('div');
    container.className = 'auth-container';

    const form = document.createElement('form');
    form.className = 'auth-form';

    // Header
    const header = document.createElement('div');
    header.className = 'auth-header';
    header.innerHTML = `
      <h2 class="auth-title">Create Account</h2>
      <p class="auth-subtitle">Please fill in your information</p>
    `;

    // Error message
    this.errorElement = document.createElement('div');
    this.errorElement.className = 'error-message';
    this.errorElement.style.display = 'none';

    // Form inputs
    const inputs = [
      new Input({
        type: 'text',
        placeholder: 'Username',
        required: true,
        onChange: (value) => this.setState({ username: value })
      }),
      new Input({
        type: 'email',
        placeholder: 'Email',
        required: true,
        onChange: (value) => this.setState({ email: value })
      }),
      new Input({
        type: 'password',
        placeholder: 'Password',
        required: true,
        onChange: (value) => this.setState({ password: value })
      }),
      new Input({
        type: 'password',
        placeholder: 'Confirm Password',
        required: true,
        onChange: (value) => this.setState({ confirmPassword: value })
      })
    ];

    // Role selection
    const roleGroup = document.createElement('div');
    roleGroup.className = 'form-group';
    
    const roleSelect = document.createElement('select');
    roleSelect.className = 'form-control';
    roleSelect.innerHTML = `
      <option value="student">Student</option>
      <option value="teacher">Teacher</option>
    `;
    roleSelect.addEventListener('change', (e) => {
      this.setState({ role: e.target.value });
    });

    roleGroup.appendChild(roleSelect);

    // Submit button
    this.submitButton = new Button({
      text: 'Create Account',
      className: 'btn-primary btn-block',
      type: 'submit'
    });

    // Switch to login link
    const switchText = document.createElement('p');
    switchText.className = 'auth-switch';
    switchText.innerHTML = `Already have an account? <a href="#" class="switch-link">Sign in</a>`;
    
    switchText.querySelector('.switch-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.onSwitchToLogin();
    });

    form.addEventListener('submit', this.handleSubmit.bind(this));

    form.appendChild(header);
    form.appendChild(this.errorElement);
    inputs.forEach(input => form.appendChild(input.render()));
    form.appendChild(roleGroup);
    form.appendChild(this.submitButton.render());
    form.appendChild(switchText);

    container.appendChild(form);
    return container;
  }
}