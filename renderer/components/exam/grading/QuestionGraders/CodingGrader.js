// renderer/components/exam/grading/QuestionGraders/CodingGrader.js
import BaseGrader from './BaseGrader.js';
import MonacoEditor from '../../../common/MonacoEditor.js'

/**
 * CodingGrader: A specialized grading component for coding question submissions
 * 
 * This class provides a comprehensive interface for grading coding answers, including:
 * - Code display in Monaco Editor
 * - Code execution capabilities
 * - Test result visualization
 * - Detailed feedback mechanism
 */
export default class CodingGrader extends BaseGrader {
    /**
     * Initialize the coding grader with submission context
     * 
     * @param {Object} options - Configuration options for the grader
     */
    constructor(options) {
        // Invoke parent constructor
        super(options);

        // Monaco code editor reference
        this.editor = null;

        // Extended state management for code execution
        this.state = {
            ...this.state,
            executionResult: null,  // Store code execution output
            isExecuting: false,     // Track code execution state
            testResults: [],        // Store test case results
            outputHistory: []       // Maintain execution output history
        };
    }

    /**
     * Execute the submitted code through appropriate language runtime
     * Provides safe, sandboxed code execution with comprehensive error handling
     */
    async executeCode() {
        try {
            // Indicate code execution is in progress
            this.setState({ isExecuting: true });
            
            // Dynamically select execution method based on language
            const response = await window.api[`execute${this.question.language}`]({
                code: this.answer.answer
            });

            // Update state with execution results
            this.setState({
                executionResult: response.success ? response.data : { error: response.error },
                isExecuting: false
            });
        } catch (error) {
            // Handle unexpected execution errors
            this.setState({
                executionResult: { error: error.message },
                isExecuting: false
            });
        }
    }

    /**
     * Render the coding answer section with code display and execution controls
     * 
     * @returns {HTMLElement} Container with code display and interaction elements
     */
    renderAnswer() {
        const container = document.createElement('div');
        container.className = 'coding-answer';

        // Display programming language information
        const languageInfo = document.createElement('div');
        languageInfo.className = 'language-info';
        languageInfo.textContent = `Language: ${this.question.language}`;
        container.appendChild(languageInfo);

        // Create code editor container
        const editorContainer = document.createElement('div');
        editorContainer.className = 'monaco-editor-container';
        editorContainer.style.height = '300px';
        container.appendChild(editorContainer);

        // Execution controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'execution-controls';

        // Code execution button
        const runButton = document.createElement('button');
        runButton.className = 'btn btn-primary run-code-btn';
        runButton.textContent = this.state.isExecuting ? 'Running...' : 'Run Code';
        runButton.disabled = this.state.isExecuting;
        runButton.addEventListener('click', () => this.executeCode());
        controlsContainer.appendChild(runButton);

        // Output display container
        const outputContainer = document.createElement('div');
        outputContainer.className = 'execution-output';
        
        // Display execution results
        if (this.state.executionResult) {
            if (this.state.executionResult.error) {
                outputContainer.innerHTML = `<pre class="error">${this.state.executionResult.error}</pre>`;
            } else {
                outputContainer.innerHTML = `<pre>${this.state.executionResult.result || 'No output'}</pre>`;
            }
        }
        
        controlsContainer.appendChild(outputContainer);
        container.appendChild(controlsContainer);

        // Initialize Monaco Editor asynchronously
        setTimeout(() => {
            if (!this.editor) {
                this.editor = new MonacoEditor({
                    language: this.question.language.toLowerCase(),
                    value: this.answer.answer,
                    readOnly: true
                });
                this.editor.mount(editorContainer);
            }
        }, 0);

        return container;
    }

    /**
     * Clean up resources when the grader is no longer needed
     * Ensures proper disposal of Monaco Editor instance
     */
    dispose() {
        if (this.editor) {
            this.editor.dispose();
            this.editor = null;
        }
    }
}