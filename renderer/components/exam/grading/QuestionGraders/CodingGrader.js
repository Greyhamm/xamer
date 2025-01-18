// renderer/components/exam/grading/QuestionGraders/CodingGrader.js
import BaseGrader from './BaseGrader.js';
import MonacoEditor from '../../../common/MonacoEditor.js';

export default class CodingGrader extends BaseGrader {
    constructor(options) {
        super(options);
        this.editor = null;
        this.state = {
            ...this.state,
            executionResult: null,
            isExecuting: false
        };
    }

    async executeCode() {
        try {
            this.setState({ isExecuting: true });
            
            const response = await window.api[`execute${this.question.language}`]({
                code: this.answer.answer
            });

            this.setState({
                executionResult: response.success ? response.data : { error: response.error },
                isExecuting: false
            });
        } catch (error) {
            this.setState({
                executionResult: { error: error.message },
                isExecuting: false
            });
        }
    }

    renderAnswer() {
        const container = document.createElement('div');
        container.className = 'coding-answer';

        // Language info
        const languageInfo = document.createElement('div');
        languageInfo.className = 'language-info';
        languageInfo.textContent = `Language: ${this.question.language}`;
        container.appendChild(languageInfo);

        // Code editor
        const editorContainer = document.createElement('div');
        editorContainer.className = 'monaco-editor-container';
        editorContainer.style.height = '300px';
        container.appendChild(editorContainer);

        // Execute controls
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'execution-controls';

        const runButton = document.createElement('button');
        runButton.className = 'btn btn-primary run-code-btn';
        runButton.textContent = this.state.isExecuting ? 'Running...' : 'Run Code';
        runButton.disabled = this.state.isExecuting;
        runButton.addEventListener('click', () => this.executeCode());
        controlsContainer.appendChild(runButton);

        // Output display
        if (this.state.executionResult) {
            const outputContainer = document.createElement('div');
            outputContainer.className = 'execution-output';
            
            if (this.state.executionResult.error) {
                outputContainer.innerHTML = `<pre class="error">${this.state.executionResult.error}</pre>`;
            } else {
                outputContainer.innerHTML = `<pre>${this.state.executionResult.result || 'No output'}</pre>`;
            }
            
            controlsContainer.appendChild(outputContainer);
        }

        container.appendChild(controlsContainer);

        // Initialize editor after container is in DOM
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

    dispose() {
        if (this.editor) {
            this.editor.dispose();
            this.editor = null;
        }
    }
}