import BaseQuestionRenderer from './BaseQuestionRenderer.js';

export default class WrittenRenderer extends BaseQuestionRenderer {
  constructor(question, options = {}) {
    super(question, options);
    this.answer = options.initialAnswer?.answer || '';
  }

  validate() {
    if (!this.answer || typeof this.answer !== 'string') {
      return false;
    }

    if (this.question.maxWords) {
      const wordCount = this.getWordCount();
      return wordCount <= this.question.maxWords;
    }

    return true;
  }

  getValue() {
    return {
      questionType: 'Written',
      questionId: this.question._id,
      answer: this.answer
    };
  }

  getWordCount() {
    return this.answer ? this.answer.trim().split(/\s+/).filter(word => word.length > 0).length : 0;
  }

  updateWordCount() {
    if (this.wordCountElement && this.question.maxWords) {
      const wordCount = this.getWordCount();
      this.wordCountElement.textContent = `${wordCount}/${this.question.maxWords} words`;
      this.wordCountElement.className = 
        wordCount > this.question.maxWords ? 'word-count exceeded' : 'word-count';
    }
  }

  render() {
    const container = super.render();
    container.className += ' written-question';

    const answerContainer = document.createElement('div');
    answerContainer.className = 'answer-container';

    const textarea = document.createElement('textarea');
    textarea.className = 'written-answer';
    textarea.value = this.answer || '';
    textarea.placeholder = 'Enter your answer here...';
    textarea.rows = 6;

    // Use a debounced update for better performance
    let updateTimeout;
    textarea.addEventListener('input', (e) => {
        e.stopPropagation();
        this.answer = e.target.value;
        
        if (updateTimeout) {
            clearTimeout(updateTimeout);
        }
        
        updateTimeout = setTimeout(() => {
            this.updateWordCount();
            this.setState(this.getValue());
        }, 100);
    });

    if (this.question.maxWords) {
        this.wordCountElement = document.createElement('div');
        this.wordCountElement.className = 'word-count';
        answerContainer.appendChild(this.wordCountElement);
        this.updateWordCount();
    }

    answerContainer.appendChild(textarea);
    container.appendChild(answerContainer);

    return container;
}
}