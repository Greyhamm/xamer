const { contextBridge, ipcRenderer } = require('electron');

class PreloadBridge {
  constructor() {
    this.userData = null;  // Initialize as null instead of loading from storage
  }
  
  loadUserData() {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const role = localStorage.getItem('role');
      
      // Always return null to force re-authentication
      return null;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  }
  
  clearUserData() {
    localStorage.clear();
    sessionStorage.clear();
    this.userData = null;
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

  getAuthHeader() {
    const token = localStorage.getItem('token');
    console.log('Getting auth header, token exists:', !!token);
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async executeCode(endpoint, data) {
    try {
      const response = await this.fetchApi({
        endpoint: `/execute/${endpoint}`,
        method: 'POST',
        data: { code: data.code, input: data.input },
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader()
        }
      });
      return { success: true, data: response };
    } catch (error) {
      console.error(`Code execution error (${endpoint}):`, error);
      return { success: false, error: error.message };
    }
  }

  async login(options) {
    try {
      const response = await this.fetchApi({
        endpoint: '/auth/login',
        data: options.data,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
  
      if (response.success) {
        this.saveUserData(response);
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed - please try again'
      };
    }
  }

  async fetchApi({ endpoint, data = {}, method = 'POST', headers = {} } = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...headers
    };

    console.log('Making API request to:', endpoint);
    console.log('Headers:', defaultHeaders);

    try {
        const url = `http://localhost:3000/api${endpoint}`;
        const response = await fetch(url, {
            method,
            headers: defaultHeaders,
            body: method !== 'GET' ? JSON.stringify(data) : undefined
        });

        const responseData = await response.json();
        console.log('API Response:', responseData);

        if (!response.ok) {
            throw new Error(responseData.error || responseData.message || 'API request failed');
        }

        return responseData;
    } catch (error) {
        console.error(`Fetch API Error at ${endpoint}:`, error);
        throw new Error(error.message || 'API request failed');
    }
  }

  exposeApi() {
    contextBridge.exposeInMainWorld('api', {
      // Existing methods...
      signup: (options) => this.fetchApi({ ...options }),
      login: (options) => this.login(options),
      getProfile: () => this.fetchApi({ endpoint: '/auth/profile', method: 'GET' }),
      
      // Add code execution methods
      executeJavaScript: (data) => this.executeCode('javascript', data),
      executePython: (data) => this.executeCode('python', data),
      executeJava: (data) => this.executeCode('java', data),

      // Class related endpoints
      createClass: (options) => this.fetchApi({
        endpoint: '/classes',
        method: 'POST',
        data: options.data,
        headers: this.getAuthHeader()
      }),
      getClasses: () => this.fetchApi({
        endpoint: '/classes',
        method: 'GET',
        headers: this.getAuthHeader()
      }),
      getClass: (options) => this.fetchApi({
        endpoint: `/classes/${options.classId}`,
        method: 'GET',
        headers: this.getAuthHeader()
      }),
      addExamToClass: (classId, examId) => this.fetchApi({
        endpoint: `/classes/${classId}/exams/${examId}`,
        method: 'POST'
      }),
      addStudentToClass: (classId, studentId) => this.fetchApi({
        endpoint: `/classes/${classId}/students`,
        method: 'POST',
        data: { studentId }
      }),
      // Student-specific endpoints
      getExams: () => this.fetchApi({
        endpoint: '/exams',
        method: 'GET',
        headers: this.getAuthHeader()
      }),
      
      getExamStats: () => this.fetchApi({
          endpoint: '/exams/stats',
          method: 'GET',
          headers: this.getAuthHeader()
      }),

      startExam: (examId) => this.fetchApi({
          endpoint: `/exams/${examId}/start`,
          method: 'POST',
          headers: this.getAuthHeader()
      }),

      submitExam: (examId, answers) => this.fetchApi({
        endpoint: `/submissions/exams/${examId}/submit`,
        method: 'POST',
        data: { answers },
        headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeader()
        }
      }),

      getSubmissions: () => this.fetchApi({
          endpoint: '/submissions',
          method: 'GET',
          headers: this.getAuthHeader()
      }),

      getSubmissionById: (submissionId) => this.fetchApi({
        endpoint: `/submissions/${submissionId}`,
        method: 'GET',
        headers: this.getAuthHeader()
      }),
     
      getExamById: (examId) => this.fetchApi({
        endpoint: `/exams/${examId}`,
        method: 'GET',
        headers: this.getAuthHeader()
      }),
      

      // Exam related endpoints
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
        try {
          return await ipcRenderer.invoke('get-exam-stats', { 
            userData: this.userData || {}
          });
        } catch (error) {
          console.error('Get exam stats error:', error);
          return {
            success: true,
            data: {
              totalExams: 0,
              publishedExams: 0,
              pendingGrading: 0,
              totalSubmissions: 0
            }
          };
        }
      },

      getRecentExams: async () => {
        try {
          return await ipcRenderer.invoke('get-recent-exams', { 
            userData: this.userData || {}
          });
        } catch (error) {
          console.error('Get recent exams error:', error);
          return {
            success: true,
            data: []
          };
        }
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
      
      uploadMedia: async (file) => {
        return await this.uploadMedia(file);
      },


        // Update student management endpoints
      searchStudents: (options) => this.fetchApi({
        endpoint: `/classes/${options.classId}/search-students?query=${encodeURIComponent(options.data.query)}`,
        method: 'GET',
        headers: this.getAuthHeader()
      }),

      addStudentToClass: (classId, studentId) => this.fetchApi({
          endpoint: `/classes/${classId}/students`,
          method: 'POST',
          data: { studentId },
          headers: {
              'Content-Type': 'application/json',
              ...this.getAuthHeader()
          }
      }),

      removeStudentFromClass: (classId, studentId) => this.fetchApi({
          endpoint: `/classes/${classId}/students/${studentId}`,
          method: 'DELETE',
          headers: this.getAuthHeader()
      }),


      getStudentStats: () => this.fetchApi({
          endpoint: '/exams/stats/student',
          method: 'GET',
          headers: this.getAuthHeader()
      }),
      
      getAvailableExams: () => this.fetchApi({
          endpoint: '/exams/available',
          method: 'GET',
          headers: this.getAuthHeader()
      }),

      gradeSubmission: (submissionId, grades) => this.fetchApi({
        endpoint: `/submissions/${submissionId}/grade`,
        method: 'POST',
        data: grades,
        headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeader()
        }
    }),
  });
}

  async uploadMedia(file) {
    try {
      const formData = new FormData();
      formData.append('media', file);
  
      const response = await fetch('http://localhost:3000/api/media/upload', {
        method: 'POST',
        headers: {
          ...this.getAuthHeader()
        },
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Media upload error:', error);
      throw error;
    }
  }
}

// Initialize preload bridge
const preloadBridge = new PreloadBridge();
preloadBridge.exposeApi();