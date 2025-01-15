import BaseQuestionRenderer from './BaseQuestionRenderer.js';
import MonacoEditor from '../../../common/MonacoEditor.js';

export default class CodingRenderer extends BaseQuestionRenderer {
  constructor(question, options = {}) {
    super(question, options);
    this.editor = null;
    this.state = {
      ...this.state,
      testResults: [],
      isExecuting: false,
      executionError: null,
      lastOutput: null,
      outputHistory: [] // Add output history
    };
    this.answer = options.initialAnswer?.answer || 
                  options.initialAnswer?.selectedOption || 
                  this.question.initialCode || 
                  '';
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.updateUI();
  }

  updateUI() {
    if (!this.outputContainer || !this.testResultsContainer) return;
  
    // Clear and update test results container
    this.testResultsContainer.innerHTML = '';
    
    // Show execution status if currently running
    if (this.state.isExecuting) {
      const statusDiv = document.createElement('div');
      statusDiv.className = 'execution-status';
      statusDiv.textContent = 'Executing code...';
      this.testResultsContainer.appendChild(statusDiv);
      return;
    }
  
    // Show error if exists
    if (this.state.executionError) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'execution-error';
      errorDiv.textContent = `Error: ${this.state.executionError}`;
      this.testResultsContainer.appendChild(errorDiv);
    }
  
    // Always show output container if we have any output
    if (this.state.lastOutput !== null) {
      this.outputContainer.innerHTML = '';
      const outputDisplay = document.createElement('div');
      outputDisplay.className = 'code-output';
      
      // Extract just the result string
      let outputText = this.state.lastOutput;
      if (typeof outputText === 'object' && outputText.success) {
        outputText = outputText.data?.result || 'No output';
      }
  
      outputDisplay.innerHTML = `
        <h4>Output:</h4>
        <pre>${outputText || 'No output'}</pre>
      `;
      
      this.outputContainer.appendChild(outputDisplay);
      this.outputContainer.style.display = 'block';
    }

    // Show test results if we have any
    if (this.state.testResults.length > 0) {
      const resultsList = document.createElement('div');
      resultsList.className = 'test-results-list';

      this.state.testResults.forEach((result, index) => {
        const resultItem = document.createElement('div');
        resultItem.className = `test-result ${result.passed ? 'passed' : 'failed'}`;
        resultItem.innerHTML = `
          <div class="test-header">
            <span class="test-number">Test Case ${index + 1}</span>
            <span class="test-status">${result.passed ? '✓ Passed' : '✗ Failed'}</span>
          </div>
          <div class="test-details">
            <div>Input: ${result.input}</div>
            <div>Expected: ${result.expected}</div>
            <div>Actual: ${result.actual}</div>
          </div>
        `;
        resultsList.appendChild(resultItem);
      });

      this.testResultsContainer.appendChild(resultsList);
    }
  }

  async executeCode() {
    try {
      this.setState({ isExecuting: true, executionError: null });
      const code = this.editor.getValue();
  
      // Execute the code
      const response = await this.executeCodeWithLanguage(code);
      console.log('Code execution response:', response);
  
      if (!response.success) {
        throw new Error(response.error || 'Execution failed');
      }
  
      // Correctly extract the output
      const output = response.data?.result || response.data || 'No output';
      this.setState({ 
        lastOutput: output,
        isExecuting: false,
        executionError: null
      });
  
      // Rest of the method remains the same...
    } catch (error) {
      console.error('Code execution error:', error);
      this.setState({
        isExecuting: false,
        executionError: error.message,
        lastOutput: null
      });
    }
  }

  async executeCodeWithLanguage(code, input = null) {
    const language = this.question.language.toLowerCase();
    try {
      switch (language) {
        case 'javascript':
          return await window.api.executeJavaScript({ code, input });
        case 'python':
          return await window.api.executePython({ code, input });
        case 'java':
          return await window.api.executeJava({ code, input });
        default:
          throw new Error(`Unsupported language: ${language}`);
      }
    } catch (error) {
      console.error('Code execution error:', error);
      throw error;
    }
  }

  render() {
    const container = super.render();
    container.className += ' coding-question';

    const languageInfo = document.createElement('div');
    languageInfo.className = 'language-info';
    languageInfo.textContent = `Language: ${this.question.language}`;
    container.appendChild(languageInfo);

    const editorContainer = document.createElement('div');
    editorContainer.className = 'monaco-editor-container';
    editorContainer.style.height = '300px';
    container.appendChild(editorContainer);

    // Create execution controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'execution-controls';
    
    // Add run button
    const runButton = document.createElement('button');
    runButton.className = 'btn btn-primary run-code-btn';
    runButton.textContent = 'Run Code';
    runButton.addEventListener('click', () => this.executeCode());
    controlsContainer.appendChild(runButton);

    // Create separate containers for output and test results
    this.outputContainer = document.createElement('div');
    this.outputContainer.className = 'output-container';
    controlsContainer.appendChild(this.outputContainer);

    this.testResultsContainer = document.createElement('div');
    this.testResultsContainer.className = 'test-results-container';
    controlsContainer.appendChild(this.testResultsContainer);

    container.appendChild(controlsContainer);

    // Initialize editor
    setTimeout(() => {
      if (!this.editor && editorContainer.isConnected) {
        this.editor = new MonacoEditor({
          language: this.question.language.toLowerCase(),
          value: this.answer,
          onChange: (value) => {
            if (value !== this.answer) {
              this.answer = value;
              this.setState(this.getValue());
            }
          }
        });
        this.editor.mount(editorContainer);
      }
    }, 0);

    return container;
  }

  getValue() {
    return {
      questionId: this.question._id,
      questionType: 'Coding',
      answer: this.editor ? this.editor.getValue() : this.answer,
      language: this.question.language
    };
  }

  dispose() {
    if (this.editor) {
      this.answer = this.editor.getValue();
      this.editor.dispose();
      this.editor = null;
    }
  }
}