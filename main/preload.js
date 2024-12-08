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
        return data; // Return the entire response object containing logs and result
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error executing code:', error);
      throw error;
    }
  },
  // Add more APIs as needed
});
