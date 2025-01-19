// In main.js or a new ProctorService.js
const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');

class ProctorService {
  constructor() {
    this.blockedProcesses = [
      'chrome', 
      'firefox', 
      'safari', 
      'edge', 
      'opera', 
      'explorer', 
      'brave'
    ];
  }

  async checkRunningApplications() {
    return new Promise((resolve, reject) => {
      // Platform-specific process listing
      const command = process.platform === 'win32' 
        ? 'tasklist' 
        : process.platform === 'darwin' 
          ? 'ps -e' 
          : 'ps aux';

      exec(command, (error, stdout) => {
        if (error) {
          console.error('Failed to list processes:', error);
          reject(error);
          return;
        }

        const runningProcesses = this.blockedProcesses.filter(proc => 
          stdout.toLowerCase().includes(proc)
        );

        resolve(runningProcesses);
      });
    });
  }

  async enforceExclusiveMode() {
    const runningApps = await this.checkRunningApplications();
    
    if (runningApps.length > 0) {
      return {
        allowed: false,
        message: `Please close the following applications before starting the exam: ${runningApps.join(', ')}`
      };
    }

    return { allowed: true };
  }
}