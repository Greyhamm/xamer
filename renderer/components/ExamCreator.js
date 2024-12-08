// renderer/components/ExamCreator.js
import { Exam,  } from '../../models/Exam.js';
import {  MultipleChoiceQuestion } from '../../models/MultipleChoiceQuestion.js';
import {  WrittenQuestion } from '../../models/WrittenQuestion.js';
import { CodingQuestion } from '../../models/CodingQuestion.js';

export default class ExamCreator {
  constructor() {
    this.exam = new Exam();
  }

  render() {
    const container = document.createElement('div');

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.placeholder = 'Exam Title';
    container.appendChild(titleInput);

    const addMCQBtn = document.createElement('button');
    addMCQBtn.textContent = 'Add Multiple Choice Question';
    container.appendChild(addMCQBtn);

    const addWrittenBtn = document.createElement('button');
    addWrittenBtn.textContent = 'Add Written Question';
    container.appendChild(addWrittenBtn);

    const addCodingBtn = document.createElement('button');
    addCodingBtn.textContent = 'Add Coding Question';
    container.appendChild(addCodingBtn);

    const saveExamBtn = document.createElement('button');
    saveExamBtn.textContent = 'Save Exam';
    container.appendChild(saveExamBtn);

    const questionsContainer = document.createElement('div');
    container.appendChild(questionsContainer);

    addMCQBtn.addEventListener('click', () => {
      const question = new MultipleChoiceQuestion();
      this.exam.addQuestion(question);
      questionsContainer.appendChild(this.createQuestionElement(question));
    });

    addWrittenBtn.addEventListener('click', () => {
      const question = new WrittenQuestion();
      this.exam.addQuestion(question);
      questionsContainer.appendChild(this.createQuestionElement(question));
    });

    addCodingBtn.addEventListener('click', () => {
      const question = new CodingQuestion();
      this.exam.addQuestion(question);
      questionsContainer.appendChild(this.createQuestionElement(question));
    });

    saveExamBtn.addEventListener('click', () => {
      // For simplicity, we'll save the exam to localStorage
      localStorage.setItem('savedExam', JSON.stringify(this.exam));
      alert('Exam Saved!');
    });

    return container;
  }

  createQuestionElement(question) {
    const div = document.createElement('div');
    div.className = 'question';

    const promptInput = document.createElement('input');
    promptInput.type = 'text';
    promptInput.placeholder = 'Question Prompt';
    promptInput.value = question.prompt;
    promptInput.addEventListener('input', (e) => {
      question.prompt = e.target.value;
    });
    div.appendChild(promptInput);

    if (question instanceof MultipleChoiceQuestion) {
      // Add options
      for (let i = 0; i < 4; i++) {
        const optionInput = document.createElement('input');
        optionInput.type = 'text';
        optionInput.placeholder = `Option ${i + 1}`;
        optionInput.value = question.options[i] || '';
        optionInput.addEventListener('input', (e) => {
          question.options[i] = e.target.value;
        });
        div.appendChild(optionInput);
      }

      const correctSelect = document.createElement('select');
      for (let i = 0; i < 4; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Option ${i + 1}`;
        correctSelect.appendChild(option);
      }
      correctSelect.value = question.correctOption;
      correctSelect.addEventListener('change', (e) => {
        question.correctOption = e.target.value;
      });
      div.appendChild(correctSelect);
    }

    if (question instanceof CodingQuestion) {
      // Coding question might have language selection, etc.
      const languageSelect = document.createElement('select');
      ['javascript', 'python', 'java'].forEach((lang) => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang.charAt(0).toUpperCase() + lang.slice(1);
        languageSelect.appendChild(option);
      });
      languageSelect.value = question.language;
      languageSelect.addEventListener('change', (e) => {
        question.language = e.target.value;
      });
      div.appendChild(languageSelect);
    }

    return div;
  }
}
