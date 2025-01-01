const { contextBridge, ipcRenderer } = require('electron');

class PreloadBridge {
  constructor() {
    this.userData = this.loadUserData();
  }

  loadUserData() {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const role = localStorage.getItem('role');
      
      if (token && userId && role) {
        const userData = { userId, role };
        console.log('Loaded user data:', userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  }

  saveUserData(responseData) {
    try {
      if (responseData.token) {
        localStorage.setItem('token', responseData.token);
        localStorage.setItem('userId', responseData.userId);
        localStorage.setItem('role', responseData.role);
        this.userData = {
          userId: responseData.userId,
          role: responseData.role
        };
        console.log('Saved user data:', this.userData);
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  // Helper to get auth header
  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async login(options) {
    try {
      const response = await this.fetchApi({
        endpoint: '/auth/login',
        data: options.data,
        method: 'POST',
        headers: options.headers
      });

      if (response.success) {
        this.saveUserData(response);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async fetchApi({ endpoint, data = {}, method = 'POST', headers = {} } = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...headers
    };

    try {
      const response = await fetch(`http://localhost:3000/api${endpoint}`, {
        method,
        headers: defaultHeaders,
        body: method !== 'GET' ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error(`Fetch API Error at ${endpoint}:`, error);
      throw error;
    }
  }

  exposeApi() {
    contextBridge.exposeInMainWorld('api', {
      signup: (options) => this.fetchApi({ ...options }),
      login: (options) => this.login(options),
      getProfile: () => this.fetchApi({ endpoint: '/auth/profile', method: 'GET' }),

      createExam: async (examData) => {
        console.log('Creating exam, user data:', this.userData);
        if (!this.userData) {
          throw new Error('User not authenticated');
        }
        return await ipcRenderer.invoke('create-exam', {
          ...examData,
          userData: this.userData
        });
      },

      getExamStats: async () => {
        if (!this.userData) {
          throw new Error('User not authenticated');
        }
        return await ipcRenderer.invoke('get-exam-stats', { userData: this.userData });
      },

      getRecentExams: async () => {
        if (!this.userData) {
          throw new Error('User not authenticated');
        }
        return await ipcRenderer.invoke('get-recent-exams', { userData: this.userData });
      },

      getRecentSubmissions: async () => {
        if (!this.userData) {
          throw new Error('User not authenticated');
        }
        return await ipcRenderer.invoke('get-recent-submissions', { userData: this.userData });
      },

      publishExam: async (examId) => {
        if (!this.userData) {
            throw new Error('User not authenticated');
        }
        return await ipcRenderer.invoke('publish-exam', {
            examId,
            userData: this.userData
        });
      },
    });
  }
}

// Initialize preload bridge
const preloadBridge = new PreloadBridge();
preloadBridge.exposeApi();