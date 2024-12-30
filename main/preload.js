const { contextBridge } = require('electron');

class PreloadBridge {
  constructor() {
    this.baseUrl = 'http://localhost:3000/api';
  }

  // Helper to get auth header
  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Generic fetch wrapper
  async fetchApi(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
          ...options.headers
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Expose API methods to renderer
  exposeApi() {
    contextBridge.exposeInMainWorld('api', {
      // Auth endpoints
      login: (credentials) => this.fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),

      signup: (userData) => this.fetchApi('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),

      getProfile: () => this.fetchApi('/auth/profile'),

      // Exam endpoints
      createExam: (examData) => this.fetchApi('/exams', {
        method: 'POST',
        body: JSON.stringify(examData)
      }),

      getExams: () => this.fetchApi('/exams'),

      getExamById: (id) => this.fetchApi(`/exams/${id}`),

      publishExam: (id) => this.fetchApi(`/exams/${id}/publish`, {
        method: 'POST'
      }),

      // Submission endpoints
      submitExam: (examId, answers) => this.fetchApi(`/exams/${examId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers })
      }),

      getSubmissions: () => this.fetchApi('/submissions'),

      gradeSubmission: (submissionId, grades) => this.fetchApi(`/submissions/${submissionId}/grade`, {
        method: 'POST',
        body: JSON.stringify({ grades })
      }),

      // Code execution endpoints
      executeJavaScript: (code) => this.fetchApi('/execute/javascript', {
        method: 'POST',
        body: JSON.stringify({ code })
      }),

      executePython: (code) => this.fetchApi('/execute/python', {
        method: 'POST',
        body: JSON.stringify({ code })
      }),

      executeJava: (code) => this.fetchApi('/execute/java', {
        method: 'POST',
        body: JSON.stringify({ code })
      }),

      // Media upload
      uploadMedia: async (file) => {
        const formData = new FormData();
        formData.append('media', file);

        const response = await fetch(`${this.baseUrl}/media/upload`, {
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