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
        const response = await window.api.signup(userData);
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
      return new Error(error.message || 'Authentication failed');
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