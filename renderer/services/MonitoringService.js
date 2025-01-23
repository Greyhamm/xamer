// renderer/services/MonitoringService.js
export default class ExamMonitoringService {
    constructor(examId) {
      this.examId = examId;
      this.sessionId = null;
      this.startTime = Date.now();
      this.setupEventListeners();
    }
  
    async startSession() {
        try {
          if (window.api?.startExamSession) {
            const response = await window.api.startExamSession({ 
              examId: this.examId,
              // Include any additional required data
              studentId: window.api.getUserId() // Add a method to get current user ID
            });
            
            if (response && response.success) {
              this.sessionId = response.sessionId;
              console.log('Exam session started successfully:', this.sessionId);
            } else {
              console.warn('Exam session start response:', response);
            }
          } else {
            console.warn('startExamSession method not available');
          }
        } catch (error) {
          // Log the full error for debugging
          console.error('Failed to start exam session:', error);
          
          // Check if it's a network error or parsing error
          if (error.message.includes('Unexpected token')) {
            console.error('Possible server error - check network tab and server logs');
          }
        }
      }
  
    setupEventListeners() {
      // Track window focus/blur
      window.addEventListener('blur', () => this.logEvent('WINDOW_SWITCH', {
        message: 'User switched away from exam window'
      }));
  
      // Track system application checks
      this.checkRunningApplications();
  
      // Prevent screenshot
      document.addEventListener('keydown', (e) => {
        if ((e.metaKey && e.key === '3') || 
            (e.ctrlKey && e.key === 'c') || 
            e.key === 'PrintScreen') {
          this.logEvent('SCREENSHOT_ATTEMPT', {
            message: 'Screenshot attempt detected'
          });
          e.preventDefault();
        }
      });
  
      // Track view changes in application
      window.addEventListener('hashchange', () => {
        this.logEvent('VIEW_CHANGE', {
          newView: window.location.hash
        });
      });
    }
  
    async checkRunningApplications() {
      try {
        // Check if method exists in window.electronAPI
        if (window.electronAPI?.getRunningApplications) {
          const runningApps = await window.electronAPI.getRunningApplications();
          if (runningApps.length > 0) {
            this.logEvent('APPLICATION_DETECTION', {
              message: 'Unauthorized applications detected',
              apps: runningApps
            });
          }
        } else {
          console.warn('getRunningApplications method not available');
        }
      } catch (error) {
        console.error('Failed to check running applications:', error);
      }
    }
  
    async logEvent(eventType, details = {}) {
      if (!this.sessionId) return;
  
      try {
        if (window.api?.logExamEvent) {
          await window.api.logExamEvent({
            examId: this.examId,
            sessionId: this.sessionId,
            eventType,
            details
          });
        } else {
          console.warn('logExamEvent method not available');
        }
      } catch (error) {
        console.error('Failed to log exam event:', error);
      }
    }
  
    async endSession() {
      if (!this.sessionId) return;
  
      try {
        if (window.api?.endExamSession) {
          await window.api.endExamSession({
            examId: this.examId,
            sessionId: this.sessionId
          });
        } else {
          console.warn('endExamSession method not available');
        }
      } catch (error) {
        console.error('Failed to end exam session:', error);
      }
    }
}