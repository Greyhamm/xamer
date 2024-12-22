// main/preload.js
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
  createExam: async (examData) => {
    try {
      const response = await fetch('http://localhost:3000/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  },
  getExams: async () => {
    try {
      const response = await fetch('http://localhost:3000/api/exams');
      const exams = await response.json();
      return exams;
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
  },
  getExamById: async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/exams/${id}`);
      const exam = await response.json();
      return exam;
    } catch (error) {
      console.error('Error fetching exam:', error);
      throw error;
    }
  },
  executeJavaScript: async (code) => {
    try {
      const response = await fetch('http://localhost:3000/api/execute/javascript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (response.ok) {
        return data; // Contains { logs: [...], result: '...' }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error executing JavaScript code:', error);
      throw error;
    }
  },
  executePython: async (code) => {
    try {
      const response = await fetch('http://localhost:3000/api/execute/python', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (response.ok) {
        return data; // Contains { result: '...' }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error executing Python code:', error);
      throw error;
    }
  },
  executeJava: async (userCode, initialCode) => { // Updated to accept initialCode
    try {
      const response = await fetch('http://localhost:3000/api/execute/java', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userCode, initialCode }), // Send both codes
      });
      const data = await response.json();
      if (response.ok) {
        return data; // Contains { result: '...' }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error executing Java code:', error);
      throw error;
    }
  },
  // **Add the uploadMedia function**
  uploadMedia: async (file) => {
    try {
      // Create a FormData object and append the file
      const formData = new FormData();
      formData.append('media', file);

      // Send the POST request to the Express server
      const response = await fetch('http://localhost:3000/api/uploadMedia', {
        method: 'POST',
        body: formData,
      });

      // Check if the response is OK (status in the range 200-299)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload media.');
      }

      // Parse and return the response data
      const data = await response.json();
      return data; // Expected to contain { url: 'https://...' }
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  },
  // Add more APIs as needed
});
