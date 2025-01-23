import AppState from '../../services/state/AppState.js';
import UserState from '../../services/state/UserState.js';

/**
 * Represents the top navigation header for the application
 * Provides navigation and user context-specific actions
 */
export default class TopHeader {
  /**
   * Initialize the top header
   * Prepares the header element for rendering
   */
  constructor() {
    // Store reference to the header element
    this.element = null;
  }

  /**
   * Handle user logout process
   * Clears local storage and reloads the page
   */
  handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    window.location.reload();
  }

  /**
   * Handle navigation back to previous view
   * Uses AppState to manage navigation history
   */
  handleBack() {
    if (AppState.canNavigateBack()) {
      AppState.navigateBack();
    }
  }

  /**
   * Create a navigation button with custom styling and behavior
   * @param {string} text - Button display text
   * @param {Function} onClick - Click event handler
   * @param {string} [variant='default'] - Button style variant
   * @returns {HTMLButtonElement} Styled navigation button
   */
  createNavButton(text, onClick, variant = 'default') {
    const button = document.createElement('button');
    button.className = `nav-button nav-button-${variant}`;
    button.textContent = text;
    button.style.cssText = `
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      background-color: ${variant === 'default' ? '#f3f4f6' : '#4f46e5'};
      color: ${variant === 'default' ? '#374151' : 'white'};
      margin-right: 1rem;
    `;

    // Add hover effects
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = variant === 'default' ? '#e5e7eb' : '#4338ca';
    });

    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = variant === 'default' ? '#f3f4f6' : '#4f46e5';
    });

    button.addEventListener('click', onClick);
    return button;
  }

  /**
   * Render the top header with navigation and user actions
   * @returns {HTMLElement} Complete header element
   */
  render() {
    const header = document.createElement('header');
    header.className = 'top-header';
    header.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 64px;
      background-color: white;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    `;

    const container = document.createElement('div');
    container.className = 'header-container';
    container.style.cssText = `
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;

    const leftSection = document.createElement('div');
    leftSection.style.cssText = `
      display: flex;
      align-items: center;
      gap: 1rem;
    `;
    
    // Add back button if navigation is possible
    if (AppState.shouldShowBackButton()) {
      const backButton = this.createNavButton('← Back', () => this.handleBack());
      leftSection.appendChild(backButton);
    }

    const title = document.createElement('h1');
    title.textContent = 'Xamer';
    title.style.cssText = `
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin-right: 2rem;
    `;

    leftSection.appendChild(title);

    // Add navigation buttons for teachers
    if (UserState.isTeacher()) {
      const dashboardButton = this.createNavButton('Dashboard', () => {
        AppState.navigateTo('teacherDashboard');
      });

      const createExamButton = this.createNavButton('Create Exam', () => {
        AppState.navigateTo('examCreator');
      }, 'primary');

      const submissionsButton = this.createNavButton('Submissions', () => {
        AppState.navigateTo('submissionsList');
      });

      leftSection.appendChild(dashboardButton);
      leftSection.appendChild(createExamButton);
      leftSection.appendChild(submissionsButton);
    }
    
    // Create logout button
    const logoutButton = document.createElement('button');
    logoutButton.className = 'logout-button';
    logoutButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
      <span>Logout</span>
    `;
    logoutButton.style.cssText = `
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      color: #dc2626;
      background: none;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background-color 0.2s;
    `;

    logoutButton.addEventListener('mouseover', () => {
      logoutButton.style.backgroundColor = '#fef2f2';
    });
    logoutButton.addEventListener('mouseout', () => {
      logoutButton.style.backgroundColor = 'transparent';
    });

    logoutButton.addEventListener('click', () => this.handleLogout());

    container.appendChild(leftSection);
    container.appendChild(logoutButton);
    header.appendChild(container);

    this.element = header;
    return header;
  }

  /**
   * Remove the header element from the DOM
   */
  dispose() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}