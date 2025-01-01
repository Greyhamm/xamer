// renderer/components/common/TopHeader.js
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
  
      // Create title
      const title = document.createElement('h1');
      title.textContent = 'Exam Application';
      title.style.cssText = `
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f2937;
      `;
  
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
      container.appendChild(title);
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