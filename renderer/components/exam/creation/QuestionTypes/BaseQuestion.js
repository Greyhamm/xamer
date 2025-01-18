import Input from '../../../common/Input.js';
import Button from '../../../common/Button.js';

class BaseQuestion {
  constructor(options = {}) {
    this.type = options.type || this.type;
    this.state = {
      prompt: options.prompt || '',
      media: options.media || null,
      points: options.points || 0,
      error: null
    };
    this.onDelete = options.onDelete;
    this.onChange = options.onChange;
    this.promptInput = null;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
  } 

  createQuestionContainer() {
    const container = super.createQuestionContainer();
  
    // Add points input after prompt
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
  
    return container;
  }
  
 

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

  updateMediaPreview(container) {
    if (!container) return;
  
    const previewContainer = container.querySelector('.media-preview');
    if (!previewContainer) return;
  
    previewContainer.innerHTML = '';
  
    if (this.state.media) {
      const element = this.state.media.type === 'image' 
        ? document.createElement('img')
        : document.createElement('video');
  
      // Construct proper URL using localhost
      const url = this.state.media.url.startsWith('http')
        ? this.state.media.url
        : `http://localhost:3000${this.state.media.url}`;
  
      element.src = url;
      element.className = 'media-preview-content';
      
      if (this.state.media.type === 'video') {
        element.controls = true;
      }
  
      // Add loading state and error handling
      element.style.display = 'none';
      const loadingText = document.createElement('div');
      loadingText.textContent = 'Loading preview...';
      loadingText.className = 'preview-loading';
      previewContainer.appendChild(loadingText);
  
      element.onload = () => {
        loadingText.remove();
        element.style.display = 'block';
      };
  
      element.onerror = () => {
        loadingText.textContent = 'Preview not available yet. Preview will be available after saving.';
        loadingText.className = 'preview-error';
      };
  
      previewContainer.appendChild(element);
  
      // Add remove button
      const removeButton = document.createElement('button');
      removeButton.className = 'btn btn-danger btn-sm remove-media';
      removeButton.textContent = 'Remove';
      removeButton.onclick = () => {
        this.setState({ media: null });
        previewContainer.innerHTML = '';
      };
      previewContainer.appendChild(removeButton);
    }
  }

  getQuestionData() {
    return {
      type: this.type,
      prompt: this.state.prompt,
      media: this.state.media,
      points: this.state.points // Add this line
    };
  }

  render() {
    const container = document.createElement('div');
    container.className = 'question-container';

    // Question header
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
        if (value !== this.state.prompt) {
          this.setState({ prompt: value });
        }
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

  // Add base dispose method
  dispose() {
    // Clean up any event listeners or resources
    if (this.promptInput) {
      this.promptInput = null;
    }
    this.onDelete = null;
    this.onChange = null;
  }
}

export default BaseQuestion;