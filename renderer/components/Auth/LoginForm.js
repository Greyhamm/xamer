import Button from '../common/Button.js';
import Input from '../common/Input.js';
import UserState from '../../services/state/UserState.js';
import AppState from '../../services/state/AppState.js'; // Added import

export default class LoginForm {
  constructor(onSwitchToSignup) {
    this.state = {
      email: '',
      password: '',
      loading: false,
      error: null
    };
    this.onSwitchToSignup = onSwitchToSignup;

    // Bind methods if necessary
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (this.state.loading) return;

    this.setState({ loading: true, error: null });

    try {
      const result = await UserState.login({
        email: this.state.email,
        password: this.state.password
      });

      if (result.role === 'teacher') {
        AppState.navigateTo('teacherDashboard');
      } else if (result.role === 'student') {
        AppState.navigateTo('studentDashboard');
      } else {
        this.setState({ error: 'Unknown user role' });
      }
    } catch (error) {
      this.setState({ error: error.message });
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