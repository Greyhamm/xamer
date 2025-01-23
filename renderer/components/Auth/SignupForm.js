import Button from '../common/Button.js';
import Input from '../common/Input.js';
import UserState from '../../services/state/UserState.js';

/**
 * Manages the user registration form UI and signup process
 * Handles form validation, user registration, and state management
 */
export default class SignupForm {
  /**
   * Initialize signup form state and configuration
   * @param {Function} onSwitchToLogin - Callback to switch to login form
   */
  constructor(onSwitchToLogin) {
    // Initialize state for form inputs and validation
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

  /**
   * Validate signup form inputs
   * Checks username, email, password, and password confirmation
   * @returns {string[]} Array of validation error messages
   */
  validateForm() {
    const errors = [];

    // Username validation
    if (!this.state.username.trim()) {
      errors.push('Username is required');
    }

    // Email validation
    if (!this.state.email.trim()) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(this.state.email)) {
      errors.push('Email is invalid');
    }

    // Password validation
    if (this.state.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    // Password confirmation validation
    if (this.state.password !== this.state.confirmPassword) {
      errors.push('Passwords do not match');
    }

    return errors;
  }

  /**
   * Handle form submission and user registration
   * Validates inputs, attempts registration, and manages loading/error states
   * @param {Event} e - The form submission event
   */
  async handleSubmit(e) {
    e.preventDefault();
    if (this.state.loading) return;

    // Validate form inputs
    const errors = this.validateForm();
    if (errors.length > 0) {
      this.setState({ error: errors.join('\n') });
      return;
    }

    // Set loading state and clear previous errors
    this.setState({ loading: true, error: null });
    this.submitButton.setLoading(true);

    try {
      // Attempt user registration
      const result = await UserState.signup({
        username: this.state.username,
        email: this.state.email,
        password: this.state.password,
        role: this.state.role
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

  /**
   * Update component state and trigger UI update
   * @param {Object} newState - New state object to merge with existing state
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.updateUI();
  }

  /**
   * Update UI elements based on current state
   * Manages error message display and visibility
   */
  updateUI() {
    if (this.errorElement) {
      this.errorElement.style.display = this.state.error ? 'block' : 'none';
      if (this.state.error) {
        this.errorElement.textContent = this.state.error;
      }
    }
  }

  /**
   * Render the signup form with inputs, buttons, and error handling
   * @returns {HTMLElement} Complete signup form container
   */
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