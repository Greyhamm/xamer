export default class BaseQuestionRenderer {
    constructor(question, options = {}) {
      this.question = question;
      this.onChange = options.onChange;
      this.answer = options.initialAnswer || null;
      this.timeStarted = Date.now();
    }
  
    setState(newState) {
      this.answer = newState;
      if (this.onChange) {
        this.onChange({
          questionId: this.question._id,
          answer: this.answer,
          timeSpent: Math.floor((Date.now() - this.timeStarted) / 1000)
        });
      }
    }
  
    renderPrompt() {
      const promptContainer = document.createElement('div');
      promptContainer.className = 'question-prompt';
  
      const promptText = document.createElement('p');
      promptText.textContent = this.question.prompt;
      promptContainer.appendChild(promptText);
  
      // Render media if present
      if (this.question.media) {
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'question-media';
  
        if (this.question.media.type === 'image') {
          const img = document.createElement('img');
          img.src = this.question.media.url;
          img.alt = 'Question media';
          mediaContainer.appendChild(img);
        } else if (this.question.media.type === 'video') {
          const video = document.createElement('video');
          video.src = this.question.media.url;
          video.controls = true;
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