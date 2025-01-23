import Button from '../common/Button.js';
import Input from '../common/Input.js';
import UserState from '../../services/state/UserState.js';
import AppState from '../../services/state/AppState.js';

/**
 * Manages the login form UI and authentication process
 * Handles user login, state management, and navigation
 */
export default class LoginForm {
  /**
   * Initialize login form state and configuration
   * @param {Function} onSwitchToSignup - Callback to switch to signup form
   */
  constructor(onSwitchToSignup) {
    // Initialize state for form inputs and handling
    this.state = {
      email: '',
      password: '',
      loading: false,
      error: null
    };
    this.onSwitchToSignup = onSwitchToSignup;
    
    // Bind methods to preserve context
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Handle form submission and user authentication
   * Validates input, attempts login, and navigates based on user role
   * @param {Event} e - The form submission event
   */
  async handleSubmit(e) {
    e.preventDefault();
    if (this.state.loading) return;

    // Set loading state and clear previous errors
    this.setState({ loading: true, error: null });
    this.submitButton.setLoading(true);

    try {
      // Attempt login using UserState
      const response = await UserState.login({
        email: this.state.email,
        password: this.state.password
      });

      console.log('Login response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      // Set user data in UserState
      UserState.setUser({
        userId: response.userId,
        role: response.role,
        username: response.username
      });

      // Navigate based on user role
      console.log('Navigating user with role:', response.role);
      if (response.role === 'teacher') {
        AppState.navigateTo('teacherDashboard');
      } else if (response.role === 'student') {
        AppState.navigateTo('studentDashboard');
      } else {
        throw new Error('Invalid user role');
      }

    } catch (error) {
      console.error('Login error:', error);
      this.setState({ 
        error: error.message || 'Login failed - please try again' 
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
   * Render the login form with inputs, buttons, and error handling
   * @returns {HTMLElement} Complete login form container
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
      <h2 class="auth-title">Welcome Back</h2>
      <p class="auth-subtitle">Please sign in to continue</p>
    `;

    // Error message
    this.errorElement = document.createElement('div');
    this.errorElement.className = 'error-message';
    this.errorElement.style.display = 'none';

    // Email input
    const emailInput = new Input({
      type: 'email',
      placeholder: 'Email',
      required: true,
      onChange: (value) => {
        this.setState({ email: value });
      }
    });

    // Password input
    const passwordInput = new Input({
      type: 'password',
      placeholder: 'Password',
      required: true,
      onChange: (value) => {
        this.setState({ password: value });
      }
    });

    // Submit button
    this.submitButton = new Button({
      text: 'Sign In',
      className: 'btn-primary btn-block',
      type: 'submit'
    });

    // Switch to signup link
    const switchText = document.createElement('p');
    switchText.className = 'auth-switch';
    switchText.innerHTML = `Don't have an account? <a href="#" class="switch-link">Sign up</a>`;
    
    switchText.querySelector('.switch-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.onSwitchToSignup();
    });

    // Append elements to form
    form.addEventListener('submit', this.handleSubmit);
    form.appendChild(header);
    form.appendChild(this.errorElement);
    form.appendChild(emailInput.render());
    form.appendChild(passwordInput.render());
    form.appendChild(this.submitButton.render());
    form.appendChild(switchText);

    container.appendChild(form);
    return container;
  }
}