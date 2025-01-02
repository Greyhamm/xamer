// renderer/components/common/TopHeader.js
import AppState from '../../services/state/AppState.js';
import UserState from '../../services/state/UserState.js';

export default class TopHeader {
    constructor() {
      this.element = null;
    }
  
    handleLogout() {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      
      // Reload the page to return to login
      window.location.reload();
    }

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

      button.addEventListener('mouseover', () => {
        button.style.backgroundColor = variant === 'default' ? '#e5e7eb' : '#4338ca';
      });

      button.addEventListener('mouseout', () => {
        button.style.backgroundColor = variant === 'default' ? '#f3f4f6' : '#4f46e5';
      });

      button.addEventListener('click', onClick);
      return button;
    }
  
    render() {
      // Create header container
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
  
      // Create inner container for content
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

      // Left section for title and navigation
      const leftSection = document.createElement('div');
      leftSection.style.cssText = `
        display: flex;
        align-items: center;
        gap: 1rem;
      `;
  
      // Create title
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
  
      // Add hover effect
      logoutButton.addEventListener('mouseover', () => {
        logoutButton.style.backgroundColor = '#fef2f2';
      });
      logoutButton.addEventListener('mouseout', () => {
        logoutButton.style.backgroundColor = 'transparent';
      });
  
      // Add click handler
      logoutButton.addEventListener('click', () => this.handleLogout());
  
      // Assemble the header
      container.appendChild(leftSection);
      container.appendChild(logoutButton);
      header.appendChild(container);
  
      this.element = header;
      return header;
    }
  
    // Method to clean up if needed
    dispose() {
      if (this.element) {
        this.element.remove();
        this.element = null;
      }
    }
}