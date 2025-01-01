import Input from '../../../common/Input.js';
import Button from '../../../common/Button.js';

class BaseQuestion {
  constructor(options = {}) {
    this.type = options.type || this.type;
    this.state = {
      prompt: options.prompt || '',
      media: options.media || null,
      error: null
    };
    this.onDelete = options.onDelete;
    this.onChange = options.onChange;
    this.promptInput = null;
  }

  setState(newState) {
    const updatedState = { 
      ...this.state, 
      ...Object.keys(newState).reduce((acc, key) => {
        acc[key] = newState[key];
        return acc;
      }, {}) 
    };

    this.state = updatedState;
    
    if (this.promptInput && this.promptInput.getValue() !== this.state.prompt) {
      this.promptInput.setValue(this.state.prompt);
    }
  }

  createQuestionContainer() {
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

    // Media upload
    const mediaContainer = this.createMediaUpload();
    container.appendChild(mediaContainer);

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
          const formData = new FormData();
          formData.append('media', file);
          
          const response = await fetch('/api/media/upload', {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (!response.ok) throw new Error('Upload failed');
          
          const data = await response.json();
          this.setState({ media: data });
          
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
    const previewContainer = container.querySelector('.media-preview');
    previewContainer.innerHTML = '';

    if (this.state.media) {
      const element = this.state.media.type === 'image' 
        ? document.createElement('img')
        : document.createElement('video');

      element.src = this.state.media.url;
      element.className = 'media-preview-content';
      
      if (this.state.media.type === 'video') {
        element.controls = true;
      }

      previewContainer.appendChild(element);

      const removeButton = document.createElement('button');
      removeButton.className = 'btn btn-danger btn-sm';
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
      prompt: this.state.prompt,
      media: this.state.media
    };
  }

  render() {
    return this.createQuestionContainer();
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