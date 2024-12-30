import Input from '../../../common/Input.js';
import Button from '../../../common/Button.js';

export default class BaseQuestion {
  constructor(options = {}) {
    this.type = 'base';
    this.state = {
      prompt: options.prompt || '',
      media: options.media || null,
      error: null
    };
    this.onDelete = options.onDelete;
    this.onChange = options.onChange;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.updateUI();
    if (this.onChange) {
      this.onChange(this.getQuestionData());
    }
  }

  updateUI() {
    // Implement in child classes
  }

  getQuestionData() {
    return {
      type: this.type,
      prompt: this.state.prompt,
      media: this.state.media
    };
  }

  validate() {
    const errors = [];
    if (!this.state.prompt.trim()) {
      errors.push('Question prompt is required');
    }
    return errors;
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

    const deleteButton = new Button({
      text: 'Delete',
      className: 'btn-danger btn-sm',
      onClick: () => this.onDelete?.()
    });

    header.appendChild(typeLabel);
    header.appendChild(deleteButton.render());
    container.appendChild(header);

    // Prompt input
    const promptInput = new Input({
      placeholder: 'Enter question prompt...',
      value: this.state.prompt,
      onChange: (value) => this.setState({ prompt: value })
    });
    container.appendChild(promptInput.render());

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
          
          // Show preview
          this.updateMediaPreview(container);
        } catch (error) {
          console.error('Media upload error:', error);
          this.setState({ error: 'Failed to upload media' });
        }
      }
    });

    container.appendChild(input);

    // Add preview container
    const previewContainer = document.createElement('div');
    previewContainer.className = 'media-preview';
    container.appendChild(previewContainer);

    // Update preview if media exists
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

      // Add remove button
      const removeButton = new Button({
        text: 'Remove',
        className: 'btn-danger btn-sm',
        onClick: () => {
          this.setState({ media: null });
          previewContainer.innerHTML = '';
        }
      });
      previewContainer.appendChild(removeButton.render());
    }
  }

  render() {
    return this.createQuestionContainer();
  }
}