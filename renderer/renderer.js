// renderer/renderer.js
import ExamCreator from './components/ExamCreator.js';
import ExamTaker from './components/ExamTaker.js';

// Function to load ExamCreator
function loadExamCreator() {
  try {
    const examCreator = new ExamCreator();
    const content = examCreator.render();
    document.getElementById('main-content').innerHTML = ''; // Clear existing content
    document.getElementById('main-content').appendChild(content);
  } catch (error) {
    console.error('Failed to load ExamCreator component.', error);
    alert('Failed to load ExamCreator component.');
  }
}

// Function to load ExamTaker
async function loadExamTaker() {
  try {
    const examTaker = new ExamTaker();
    const content = await examTaker.render(); // Await the Promise
    document.getElementById('main-content').innerHTML = ''; // Clear existing content
    document.getElementById('main-content').appendChild(content); // Append the resolved Node
  } catch (error) {
    console.error('Failed to load ExamTaker component.', error);
    alert('Failed to load ExamTaker component.');
  }
}

// Event Listeners for Buttons
document.getElementById('create-exam-btn').addEventListener('click', loadExamCreator);
document.getElementById('take-exam-btn').addEventListener('click', loadExamTaker);
