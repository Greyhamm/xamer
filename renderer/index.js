import App from './App.js';
// import './styles/main.css';

// Wait for DOM content to be loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Monaco Editor
  require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.33.0/min/vs' }});
  window.MonacoEnvironment = {
    getWorkerUrl: function(workerId, label) {
      return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
        self.MonacoEnvironment = {
          baseUrl: 'https://unpkg.com/monaco-editor@0.33.0/min/'
        };
        importScripts('https://unpkg.com/monaco-editor@0.33.0/min/vs/base/worker/workerMain.js');`
      )}`;
    }
  };

  // Create loading indicator
  const loadingElement = document.createElement('div');
  loadingElement.className = 'initial-loading';
  loadingElement.textContent = 'Loading application...';
  document.body.appendChild(loadingElement);

  // Initialize application after Monaco is loaded
  require(['vs/editor/editor.main'], () => {
    window.monaco = monaco;
    
    // Initialize the application
    window.app = new App();
    
    // Remove loading indicator
    document.body.removeChild(loadingElement);
  });
});