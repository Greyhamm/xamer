const { contextBridge, ipcRenderer } = require('electron');

class PreloadBridge {
  constructor() {
    // Initialize any necessary properties
  }

  // Helper to get auth header
  getAuthHeader() {
    const token = localStorage.getItem('token'); // Example token retrieval
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Generic fetch wrapper
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

      // Check if response is OK
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API request failed');
      }

      const responseData = await response.json(); // Parse JSON here

      return responseData; // Return parsed data
    } catch (error) {
      console.error(`Fetch API Error at ${endpoint}:`, error);
      throw error;
    }
  }

  // Expose API methods to renderer
  exposeApi() {
    contextBridge.exposeInMainWorld('api', {
      signup: (options) => this.fetchApi({ endpoint: options.endpoint, data: options.data, method: 'POST', headers: options.headers }),
      login: (options) => this.fetchApi({ endpoint: options.endpoint, data: options.data, method: 'POST', headers: options.headers }),
      getProfile: () => this.fetchApi({ endpoint: '/auth/profile', method: 'GET' }),

      createExam: (examData) => ipcRenderer.invoke('create-exam', examData),
      publishExam: (examId) => ipcRenderer.invoke('publish-exam', examId),
      getExams: () => ipcRenderer.invoke('get-exams'),
      getExamById: (examId) => ipcRenderer.invoke('get-exam-by-id', examId),

      // Added Methods
      getExamStats: () => ipcRenderer.invoke('get-exam-stats'),
      getRecentExams: () => ipcRenderer.invoke('get-recent-exams'),
      getRecentSubmissions: () => ipcRenderer.invoke('get-recent-submissions'),

      submitExam: (examId, answers) => this.fetchApi({ endpoint: `/exams/${examId}/submit`, data: { answers }, method: 'POST' }),

      getSubmissions: () => this.fetchApi({ endpoint: '/submissions', method: 'GET' }),

      gradeSubmission: (submissionId, grades) => this.fetchApi({ endpoint: `/submissions/${submissionId}/grade`, data: { grades }, method: 'POST' }),

      executeJavaScript: (code) => this.fetchApi({ endpoint: '/execute/javascript', data: { code }, method: 'POST' }),

      executePython: (code) => this.fetchApi({ endpoint: '/execute/python', data: { code }, method: 'POST' }),

      executeJava: (code) => this.fetchApi({ endpoint: '/execute/java', data: { code }, method: 'POST' }),

      uploadMedia: async (file) => {
        const formData = new FormData();
        formData.append('media', file);

        const response = await fetch(`http://localhost:3000/api/media/upload`, {
          method: 'POST',
          headers: this.getAuthHeader(),
          body: formData
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        return response.json();
      }
    });
  }
}

// Initialize preload bridge
const preloadBridge = new PreloadBridge();
preloadBridge.exposeApi();