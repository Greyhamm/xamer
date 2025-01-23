import BaseQuestion from './BaseQuestion.js';
import MonacoEditor from '../../../common/MonacoEditor.js';

/**
 * CodingQuestion: A specialized component for creating coding exam questions
 * 
 * This class provides a comprehensive interface for defining coding questions with:
 * - Language selection
 * - Initial code template
 * - Monaco code editor integration
 * - Flexible configuration options
 */
export default class CodingQuestion extends BaseQuestion {
    /**
     * Initialize the coding question configuration
     * 
     * @param {Object} options - Configuration options for the coding question
     * @param {Function} options.onDelete - Callback to remove this question
     * @param {Function} options.onChange - Callback for question state changes
     */
    constructor(options = {}) {
        // Call parent constructor
        super(options);

        // Set specific question type
        this.type = 'Coding';

        // Extended state for coding-specific attributes
        this.state = {
            ...this.state,
            language: options.language || 'javascript', // Default language
            initialCode: options.initialCode || '', // Initial code template
            testCases: options.testCases || [], // Test cases for code validation
        };

        // Editor instance tracking
        this.editor = null;
        this.editorContainer = null;
        this.isEditorInitialized = false;
    }

    /**
     * Prepare question data for submission
     * 
     * @returns {Object} Comprehensive coding question data
     */
    getQuestionData() {
        return {
            // Spread base question data (includes points, prompt, etc.)
            ...super.getQuestionData(),
            type: this.type,
            language: this.state.language,
            // Get current code from editor or fallback to initial state
            initialCode: this.editor ? this.editor.getValue() : this.state.initialCode,
        };
    }

    /**
     * Render the complete coding question creation interface
     * 
     * @returns {HTMLElement} Container with coding question configuration elements
     */
    render() {
        // Create base container using parent method
        const container = super.render();
        container.className += ' coding-question';
    
        // Language selection dropdown
        const languageSelect = document.createElement('select');
        languageSelect.className = 'form-control';
        languageSelect.innerHTML = `
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
        `;
        languageSelect.value = this.state.language;

        // Language change event handler
        languageSelect.addEventListener('change', (e) => {
            const newLanguage = e.target.value;
            if (newLanguage !== this.state.language) {
                const currentCode = this.editor ? this.editor.getValue() : '';
                this.setState({ 
                    language: newLanguage,
                    initialCode: currentCode || this.getDefaultInitialCodeForLanguage(newLanguage)
                });
                this.reinitializeEditor();
            }
        });

        container.appendChild(languageSelect);

        // Create editor container with explicit dimensions
        this.editorContainer = document.createElement('div');
        this.editorContainer.className = 'monaco-editor-container';
        Object.assign(this.editorContainer.style, {
            height: '300px',
            width: '100%',
            border: '1px solid #ccc',
            marginTop: '1rem',
            position: 'relative',
            overflow: 'hidden'
        });
        container.appendChild(this.editorContainer);

        // Initialize editor after container is in DOM
        if (!this.isEditorInitialized) {
            requestAnimationFrame(() => {
                this.initializeEditor();
            });
        }

        return container;
    }

    /**
     * Get default initial code template for a specific language
     * 
     * @param {string} language - Programming language identifier
     * @returns {string} Default code template
     */
    getDefaultInitialCodeForLanguage(language) {
        const defaults = {
            'javascript': '// Write your JavaScript code here\n',
            'python': '# Write your Python code here\n',
            'java': '// Write your Java code here\n'
        };
        return defaults[language] || '';
    }

    /**
     * Reinitialize the Monaco Editor when language changes
     * Preserves existing code content
     */
    reinitializeEditor() {
        if (this.editor) {
            const currentValue = this.editor.getValue();
            this.editor.dispose();
            this.editor = null;
            this.isEditorInitialized = false;
            // Add a small delay before reinitializing
            setTimeout(() => {
                this.initializeEditor(currentValue);
            }, 50);
        }
    }

    /**
     * Initialize Monaco Editor with language-specific configuration
     * 
     * @param {string} [preservedValue] - Optional existing code to preserve
     */
    initializeEditor(preservedValue) {
        if (this.isEditorInitialized || !this.editorContainer) return;

        try {
            if (!this.editor) {
                this.editor = new MonacoEditor({
                    language: this.state.language,
                    value: preservedValue || this.state.initialCode || this.getDefaultInitialCodeForLanguage(this.state.language),
                    onChange: (value) => {
                        this.state.initialCode = value;
                    },
                    readOnly: false
                });
            }

            if (this.editorContainer) {
                this.editor.mount(this.editorContainer);
                this.isEditorInitialized = true;
            }
        } catch (error) {
            console.error('Error initializing Monaco Editor:', error);
        }
    }
    
    /**
     * Clean up resources when the question is no longer needed
     */
    dispose() {
        // Call parent dispose method
        super.dispose();

        // Clean up CodingQuestion specific resources
        if (this.editor) {
            this.editor.dispose();
            this.editor = null;
        }
        this.editorContainer = null;
        this.isEditorInitialized = false;
        this.state = null;
    }
}