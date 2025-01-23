import Input from '../../../common/Input.js';

/**
 * BaseQuestion: Abstract base class for all question types in exam creation
 * 
 * Provides a standardized interface and common functionality for:
 * - Question prompt management
 * - Media attachment
 * - Points tracking
 * - Basic UI generation
 */
export default class BaseQuestion {
    /**
     * Initialize base question configuration
     * 
     * @param {Object} options - Configuration options for the question
     * @param {Function} options.onDelete - Callback to remove this question
     * @param {Function} options.onChange - Callback for question state changes
     */
    constructor(options = {}) {
        // Set question type (to be overridden by child classes)
        this.type = options.type || 'BaseQuestion';

        // Initialize question state
        this.state = {
            prompt: options.prompt || '',     // Question text
            media: options.media || null,     // Optional media attachment
            points: options.points || 0,      // Point value
            error: null                       // Error tracking
        };

        // Tracking callbacks
        this.onDelete = options.onDelete;
        this.onChange = options.onChange;
        this.promptInput = null;
    }

    /**
     * Update question state and trigger change notifications
     * 
     * @param {Object} newState - New state to merge with existing state
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.onChange?.(this.getQuestionData());
    }

    /**
     * Create media upload interface
     * Supports image and video file uploads
     * 
     * @returns {HTMLElement} Media upload container
     */
    createMediaUpload() {
        const container = document.createElement('div');
        container.className = 'media-upload';
    
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.className = 'media-input';
    
        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const response = await window.api.uploadMedia(file);
                    
                    if (!response.success) {
                        throw new Error(response.error || 'Upload failed');
                    }
                    
                    this.setState({ media: response.data });
                    this.updateMediaPreview(container);
                } catch (error) {
                    console.error('Media upload error:', error);
                    this.setState({ error: 'Failed to upload media' });
                }
            }
        });
    
        container.appendChild(input);
    
        const previewContainer = document.createElement('div');
        previewContainer.className = 'media-preview';
        container.appendChild(previewContainer);
    
        if (this.state.media) {
            this.updateMediaPreview(container);
        }
    
        return container;
    }

    /**
     * Update media preview after successful upload
     * 
     * @param {HTMLElement} container - Media upload container
     */
    updateMediaPreview(container) {
        const previewContainer = container.querySelector('.media-preview');
        previewContainer.innerHTML = '';
    
        if (this.state.media) {
            const element = this.state.media.type === 'image' 
                ? document.createElement('img')
                : document.createElement('video');
    
            const url = this.state.media.url.startsWith('http')
                ? this.state.media.url
                : `http://localhost:3000${this.state.media.url}`;
    
            element.src = url;
            element.className = 'media-preview-content';
            
            if (this.state.media.type === 'video') {
                element.controls = true;
            }
    
            element.onload = () => {
                previewContainer.appendChild(element);
            };
    
            element.onerror = () => {
                const errorText = document.createElement('div');
                errorText.textContent = 'Preview not available';
                errorText.className = 'preview-error';
                previewContainer.appendChild(errorText);
            };
        }
    }

    /**
     * Prepare question data for submission
     * 
     * @returns {Object} Comprehensive question data
     */
    getQuestionData() {
        return {
            type: this.type,
            prompt: this.state.prompt,
            media: this.state.media,
            points: this.state.points
        };
    }

    /**
     * Render base question creation interface
     * 
     * @returns {HTMLElement} Question creation container
     */
    render() {
        const container = document.createElement('div');
        container.className = 'question-container';

        // Question type and delete button
        const header = document.createElement('div');
        header.className = 'question-header';
        
        const typeLabel = document.createElement('span');
        typeLabel.className = 'question-type';
        typeLabel.textContent = this.type;

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => this.onDelete?.();

        header.appendChild(typeLabel);
        header.appendChild(deleteButton);
        container.appendChild(header);

        // Prompt input
        this.promptInput = new Input({
            placeholder: 'Enter question prompt...',
            value: this.state.prompt,
            onChange: (value) => {
                this.setState({ prompt: value });
            }
        });
        container.appendChild(this.promptInput.render());

        // Points input
        const pointsGroup = document.createElement('div');
        pointsGroup.className = 'form-group';
        
        const pointsLabel = document.createElement('label');
        pointsLabel.textContent = 'Points';
        
        const pointsInput = document.createElement('input');
        pointsInput.type = 'number';
        pointsInput.min = '0';
        pointsInput.className = 'form-control points-input';
        pointsInput.value = this.state.points;
        pointsInput.addEventListener('input', (e) => {
            this.setState({ points: parseInt(e.target.value) || 0 });
        });

        pointsGroup.appendChild(pointsLabel);
        pointsGroup.appendChild(pointsInput);
        container.appendChild(pointsGroup);

        // Media upload
        const mediaContainer = this.createMediaUpload();
        container.appendChild(mediaContainer);

        return container;
    }

    /**
     * Clean up resources when question is removed
     */
    dispose() {
        this.onDelete = null;
        this.onChange = null;
    }
}