import BaseQuestion from './BaseQuestion.js';
import MonacoEditor from '../../../common/MonacoEditor.js';
import Button from '../../../common/Button.js';

export default class CodingQuestion extends BaseQuestion {
  constructor(options = {}) {
    super(options);
    this.type = 'Coding';
    this.state = {
      ...this.state,
      language: options.language || 'javascript',
      initialCode: options.initialCode || '',
      testCases: options.testCases || [],
      executionResult: null
    };
    this.editor = null;
  }

  getQuestionData() {
    return {
      ...super.getQuestionData(),
      language: this.state.language,
      initialCode: this.state.initialCode,
      testCases: this.state.testCases
    };
  }

  validate() {
    const errors = super.validate();
    if (!this.state.language) {
      errors.push('Programming language must be selected');
    }
    return errors;
  }

  async executeCode() {
    try {
      const code = this.editor.getValue();
      const response = await window.api[`execute${this.state.language}`](code);
      this.setState({ executionResult: response });
    } catch (error) {
      this.setState({ error: error.message });
    }
  }

  render() {
    const container = super.createQuestionContainer();

    // Language selection
    const languageGroup = document.createElement('div');
    languageGroup.className = 'form-group';
    
    const languageSelect = document.createElement('select');
    languageSelect.className = 'form-control';
    languageSelect.innerHTML = `
      <option value="javascript">JavaScript</option>
      <option value="python">Python</option>
      <option value="java">Java</option>
    `;
    languageSelect.value = this.state.language;
    languageSelect.addEventListener('change', (e) => {
      this.setState({ language: e.target.value });
      if (this.editor) {
        this.editor.updateLanguage(e.target.value);
      }
    });

    languageGroup.appendChild(languageSelect);

    // Code editor
    const editorContainer = document.createElement('div');
    editorContainer.className = 'monaco-editor-container';
    
    this.editor = new MonacoEditor({
      language: this.state.language,
      value: this.state.initialCode,
      onChange: (value) => this.setState({ initialCode: value })
    });

    // Test cases
    const testCasesContainer = document.createElement('div');
    testCasesContainer.className = 'test-cases-container';
    
    const addTestCaseButton = new Button({
      text: 'Add Test Case',
      className: 'btn-secondary',
      onClick: () => this.addTestCase()
    });

    this.testCasesList = document.createElement('div');
    this.testCasesList.className = 'test-cases-list';
    this.renderTestCases();

    testCasesContainer.appendChild(addTestCaseButton.render());
    testCasesContainer.appendChild(this.testCasesList);

    // Execute button
    const executeButton = new Button({
      text: 'Test Code',
      className: 'btn-primary',
      onClick: () => this.executeCode()
    });

    // Output display
    const outputContainer = document.createElement('div');
    outputContainer.className = 'code-output';
    if (this.state.executionResult) {
      outputContainer.textContent = this.state.executionResult;
    }

    container.appendChild(languageGroup);
    container.appendChild(editorContainer);
    container.appendChild(testCasesContainer);
    container.appendChild(executeButton.render());
    container.appendChild(outputContainer);

    // Initialize Monaco editor after container is added to DOM
    setTimeout(() => {
      this.editor.mount(editorContainer);
    }, 0);

    return container;
  }

  addTestCase() {
    this.state.testCases.push({
      input: '',
      expectedOutput: '',
      points: 0
    });
    this.renderTestCases();
  }

  renderTestCases() {
    if (!this.testCasesList) return;

    this.testCasesList.innerHTML = '';
    this.state.testCases.forEach((testCase, index) => {
      const testCaseElement = this.createTestCaseElement(testCase, index);
      this.testCasesList.appendChild(testCaseElement);
    });
  }

  createTestCaseElement(testCase, index) {
    const element = document.createElement('div');
    element.className = 'test-case';

    const inputs = [
      { label: 'Input', key: 'input', value: testCase.input },
      { label: 'Expected Output', key: 'expectedOutput', value: testCase.expectedOutput },
      { label: 'Points', key: 'points', type: 'number', value: testCase.points }
    ];

    inputs.forEach(({ label, key, type, value }) => {
      const group = document.createElement('div');
      group.className = 'form-group';
      
      const inputLabel = document.createElement('label');
      inputLabel.textContent = label;
      
      const input = new Input({
        type: type || 'text',
        value: value,
        onChange: (newValue) => {
          this.state.testCases[index][key] = newValue;
          this.setState({ testCases: this.state.testCases });
        }
      });

      group.appendChild(inputLabel);
      group.appendChild(input.render());
      element.appendChild(group);
    });

    const removeButton = new Button({
      text: 'Remove',
      className: 'btn-danger btn-sm',
      onClick: () => {
        this.state.testCases.splice(index, 1);
        this.setState({ testCases: this.state.testCases });
      }
    });

    element.appendChild(removeButton.render());
    return element;
  }
}