import BaseGrader from './BaseGrader.js';
import MonacoEditor from '../../../common/MonacoEditor.js';

export default class CodingGrader extends BaseGrader {
  constructor(options) {
    super(options);
    this.editor = null;
    this.executionResult = null;
  }

  async executeCode() {
    try {
      this.executionButton.disabled = true;
      this.executionButton.textContent = 'Executing...';
      
      const response = await window.api[`execute${this.question.language}`](this.answer.answer);
      this.executionResult = response;
      
      this.updateExecutionDisplay(response);
    } catch (error) {
      this.updateExecutionDisplay({ error: error.message }, true);
    } finally {
      this.executionButton.disabled = false;
      this.executionButton.textContent = 'Run Code';
    }
  }

  updateExecutionDisplay(result, isError = false) {
    if (!this.outputContainer) return;

    this.outputContainer.className = `execution-output ${isError ? 'error' : ''}`;
    
    if (isError) {
      this.outputContainer.textContent = `Error: ${result.error}`;
      return;
    }

    let output = '';
    if (result.logs && result.logs.length > 0) {
      output += result.logs.join('\n');
    }
    if (result.result) {
      if (output) output += '\n';
      output += result.result;
    }

    this.outputContainer.textContent = output || 'No output';
  }

  renderAnswerDisplay() {
    const container = document.createElement('div');
    container.className = 'coding-answer';

    // Code display
    const editorContainer = document.createElement('div');
    editorContainer.className = 'monaco-editor-container';

    this.editor = new MonacoEditor({
      language: this.question.language,
      value: this.answer.answer,
      readOnly: true
    });

    // Execution controls
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'execution-controls';

    this.executionButton = document.createElement('button');
    this.executionButton.className = 'btn btn-primary';
    this.executionButton.textContent = 'Run Code';
    this.executionButton.addEventListener('click', () => this.executeCode());

    this.outputContainer = document.createElement('pre');
    this.outputContainer.className = 'execution-output';

    controlsContainer.appendChild(this.executionButton);
    controlsContainer.appendChild(this.outputContainer);

    // Test cases if available
    if (this.question.testCases && this.question.testCases.length > 0) {
      const testCasesContainer = this.renderTestCases();
      container.appendChild(testCasesContainer);
    }

    container.appendChild(editorContainer);
    container.appendChild(controlsContainer);

    // Initialize editor after container is in DOM
    setTimeout(() => {
      this.editor.mount(editorContainer);
    }, 0);

    return container;
  }

  renderTestCases() {
    const container = document.createElement('div');
    container.className = 'test-cases-container';
    
    container.innerHTML = `<h4>Test Cases</h4>`;

    const table = document.createElement('table');
    table.className = 'test-cases-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Input</th>
          <th>Expected Output</th>
          <th>Points</th>
          <th>Result</th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');
    this.question.testCases.forEach(testCase => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${testCase.input}</td>
        <td>${testCase.expectedOutput}</td>
        <td>${testCase.points}</td>
        <td class="test-result">Pending</td>
      `;
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
    return container;
  }
}