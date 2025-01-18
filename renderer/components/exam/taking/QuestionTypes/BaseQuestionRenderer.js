export default class BaseQuestionRenderer {
  constructor(question, options = {}) {
    this.question = question;
    this.onChange = options.onChange;
    this.answer = options.initialAnswer || null;
    this.timeStarted = Date.now();
  }
  
  setState(newState) {
    if (this.onChange) {
      this.onChange({
        questionId: this.question._id,
        ...newState,
        timeSpent: Math.floor((Date.now() - this.timeStarted) / 1000)
      });
    }
  }
  
  renderPrompt() {
    const promptContainer = document.createElement('div');
    promptContainer.className = 'question-prompt';
  
    // Add points display
    const pointsDisplay = document.createElement('div');
    pointsDisplay.className = 'question-points';
    pointsDisplay.textContent = `Points: ${this.question.points}`;
    promptContainer.appendChild(pointsDisplay);

    const promptText = document.createElement('p');
    promptText.textContent = this.question.prompt;
    promptContainer.appendChild(promptText);
  
    if (this.question.media) {
      const mediaContainer = document.createElement('div');
      mediaContainer.className = 'question-media';
      mediaContainer.style.maxWidth = '500px'; // Limit maximum width
      mediaContainer.style.margin = '1rem auto'; // Center the media
  
      if (this.question.media.type === 'image') {
        const img = document.createElement('img');
        const baseUrl = 'http://localhost:3000';
        img.src = this.question.media.url.startsWith('http') ? 
          this.question.media.url : 
          `${baseUrl}${this.question.media.url}`;
        img.alt = 'Question media';
        
        // Add image styling
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.margin = '0 auto';
        img.style.borderRadius = '4px';
        
        img.onerror = () => {
          img.style.display = 'none';
          const errorText = document.createElement('p');
          errorText.className = 'media-error';
          errorText.textContent = 'Failed to load image';
          mediaContainer.appendChild(errorText);
        };
        
        mediaContainer.appendChild(img);
      } else if (this.question.media.type === 'video') {
        const video = document.createElement('video');
        const baseUrl = 'http://localhost:3000';
        video.src = this.question.media.url.startsWith('http') ? 
          this.question.media.url : 
          `${baseUrl}${this.question.media.url}`;
        video.controls = true;
        video.style.maxWidth = '100%';
        video.style.height = 'auto';
        
        video.onerror = () => {
          video.style.display = 'none';
          const errorText = document.createElement('p');
          errorText.className = 'media-error';
          errorText.textContent = 'Failed to load video';
          mediaContainer.appendChild(errorText);
        };
        
        mediaContainer.appendChild(video);
      }
  
      promptContainer.appendChild(mediaContainer);
    }
  
    return promptContainer;
  }
  
  validate() {
    return true;
  }
  
  getValue() {
    return this.answer;
  }
  
  render() {
    const container = document.createElement('div');
    container.className = 'question-container';
    container.appendChild(this.renderPrompt());
    return container;
  }
}