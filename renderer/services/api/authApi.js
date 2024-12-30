class AuthAPI {
    static async login(credentials) {
      try {
        const response = await window.api.login(credentials);
        this.handleAuthResponse(response);
        return response;
      } catch (error) {
        throw this.handleError(error);
      }
    }
  
    static async signup(userData) {
      try {
        // Add explicit endpoint URL and headers
        const response = await window.api.signup({
          endpoint: '/auth/signup', // Remove /api prefix if not needed
          data: userData,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Signup failed: ${response.statusText}`);
        }
        
        this.handleAuthResponse(response);
        return response;
      } catch (error) {
        throw this.handleError(error);
      }
    }
  
    static async getProfile() {
      try {
        return await window.api.getProfile();
      } catch (error) {
        throw this.handleError(error);
      }
    }
  
    static handleAuthResponse(response) {
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
      }
    }
  
    static handleError(error) {
      console.error('Auth API Error:', error);
      // Improve error message
      const message = error.message || 'Authentication failed. Please try again.';
      return new Error(message);
    }
  
    static logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.reload();
    }
  
    static isAuthenticated() {
      return !!localStorage.getItem('token');
    }
  
    static getRole() {
      return localStorage.getItem('role');
    }
  }
  
  export default AuthAPI;