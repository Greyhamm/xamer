// main/preload.js
const { contextBridge } = require('electron');

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

contextBridge.exposeInMainWorld('api', {
  // Auth endpoints
  signup: async (userData) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }
      return response.json();
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }
      return response.json();
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/profile', {
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch profile');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  

  getExamById: async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/exams/${id}`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch exam');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching exam:', error);
      throw error;
    }
  },

// In preload.js
submitExam: async (examId, answers) => {
  try {
    console.log('Submitting exam with ID:', examId);
    console.log('Answers:', answers);

    const response = await fetch(`http://localhost:3000/api/exams/${examId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ answers }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit exam');
    }

    const data = await response.json();
    console.log('Submission response:', data);
    return data;
  } catch (error) {
    console.error('Error in submitExam:', error);
    throw error;
  }
},

  getSubmissions: async () => {
    try {
      const response = await fetch('http://localhost:3000/api/submissions', {
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch submissions');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  },

  // Add to preload.js
  gradeSubmission: async (submissionId, grades) => {
    try {
      const response = await fetch(`http://localhost:3000/api/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ grades }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to grade submission');
      }

      return response.json();
    } catch (error) {
      console.error('Error grading submission:', error);
      throw error;
    }
  },

  // Code execution endpoints with authentication
  executeJavaScript: async (code) => {
    try {
      const response = await fetch('http://localhost:3000/api/execute/javascript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to execute JavaScript');
      }
      return response.json();
    } catch (error) {
      console.error('Error executing JavaScript:', error);
      throw error;
    }
  },

  executePython: async (code) => {
    try {
      const response = await fetch('http://localhost:3000/api/execute/python', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to execute Python');
      }
      return response.json();
    } catch (error) {
      console.error('Error executing Python:', error);
      throw error;
    }
  },

  executeJava: async (code) => {
    try {
      const response = await fetch('http://localhost:3000/api/execute/java', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to execute Java');
      }
      return response.json();
    } catch (error) {
      console.error('Error executing Java:', error);
      throw error;
    }
  },

  uploadMedia: async (file) => {
    try {
      const formData = new FormData();
      formData.append('media', file);

      const response = await fetch('http://localhost:3000/api/uploadMedia', {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload media');
      }
      return response.json();
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  },

  getTeacherStats: async () => {
    try {
      const response = await fetch('http://localhost:3000/api/teacher/stats', {
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch teacher stats');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching teacher stats:', error);
      throw error;
    }
  },
  
  getStudentStats: async () => {
    try {
      const response = await fetch('http://localhost:3000/api/student/stats', {
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch student stats');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching student stats:', error);
      throw error;
    }
  },
  
  updateExamStatus: async (examId, status) => {
    try {
      const response = await fetch(`http://localhost:3000/api/exams/${examId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update exam status');
      }
      return response.json();
    } catch (error) {
      console.error('Error updating exam status:', error);
      throw error;
    }
  },
  
  getExamStats: async (examId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/exams/${examId}/stats`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch exam stats');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching exam stats:', error);
      throw error;
    }
  },
  // Add to your preload.js contextBridge.exposeInMainWorld
// Add to your preload.js contextBridge.exposeInMainWorld
publishExam: async (examId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/exams/${examId}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to publish exam');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error publishing exam:', error);
    throw error;
  }
},

// Add to your preload.js

getExams: async () => {
  try {
    console.log('Fetching exams...');
    const response = await fetch('http://localhost:3000/api/exams', {
      headers: {
        ...getAuthHeader(),
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error response:', error);
      throw new Error(error.message || 'Failed to fetch exams');
    }
    
    const exams = await response.json();
    console.log('Successfully fetched exams:', exams);
    return exams;
  } catch (error) {
    console.error('Error in getExams:', error);
    throw error;
  }
},

createExam: async (examData) => {
  try {
    console.log('Creating exam with data:', examData);
    const response = await fetch('http://localhost:3000/api/exams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(examData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Error response:', error);
      throw new Error(error.message || 'Failed to create exam');
    }
    
    const result = await response.json();
    console.log('Successfully created exam:', result);
    return result;
  } catch (error) {
    console.error('Error in createExam:', error);
    throw error;
  }
}
});

