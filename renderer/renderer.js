// renderer/renderer.js
const createExamBtn = document.getElementById('create-exam-btn');
const takeExamBtn = document.getElementById('take-exam-btn');
const mainContent = document.getElementById('main-content');

let ExamCreator, ExamTaker; // Will be loaded dynamically

createExamBtn.addEventListener('click', async () => {
  if (!ExamCreator) {
    try {
      const module = await import('./components/ExamCreator.js');
      ExamCreator = module.default;
    } catch (err) {
      console.error('Failed to load ExamCreator.js:', err);
      alert('Failed to load ExamCreator component.');
      return;
    }
  }
  mainContent.innerHTML = '';
  const creator = new ExamCreator();
  mainContent.appendChild(creator.render());
});

takeExamBtn.addEventListener('click', async () => {
  if (!ExamTaker) {
    try {
      const module = await import('./components/ExamTaker.js');
      ExamTaker = module.default;
    } catch (err) {
      console.error('Failed to load ExamTaker.js:', err);
      alert('Failed to load ExamTaker component.');
      return;
    }
  }
  mainContent.innerHTML = '';
  const taker = new ExamTaker();
  mainContent.appendChild(taker.render());
});
