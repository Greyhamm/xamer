export default class ClassCard {
    constructor(classData, onExamClick) {
      this.classData = classData;
      this.onExamClick = onExamClick;
    }
  
    render() {
      const container = document.createElement('div');
      container.className = 'class-card';
      
      container.innerHTML = `
        <div class="class-header">
          <h3>${this.classData.name}</h3>
          <p>${this.classData.description || ''}</p>
        </div>
        <div class="class-stats">
          <div>Students: ${this.classData.students.length}</div>
          <div>Exams: ${this.classData.exams.length}</div>
        </div>
        <div class="class-exams">
          <h4>Exams</h4>
          <div class="exams-list"></div>
        </div>
        <div class="class-actions">
          <button class="btn btn-primary add-exam-btn">Add Exam</button>
          <button class="btn btn-secondary manage-students-btn">Manage Students</button>
        </div>
      `;
  
      const examsList = container.querySelector('.exams-list');
      this.classData.exams.forEach(exam => {
        const examItem = document.createElement('div');
        examItem.className = 'exam-item';
        examItem.innerHTML = `
          <span>${exam.title}</span>
          <span class="status-badge ${exam.status}">${exam.status}</span>
        `;
        examItem.addEventListener('click', () => this.onExamClick(exam));
        examsList.appendChild(examItem);
      });
  
      // Add event listeners
      container.querySelector('.add-exam-btn').addEventListener('click', () => {
        // Navigate to exam creator with class context
        window.location.hash = `#/exam/create/${this.classData._id}`;
      });
  
      container.querySelector('.manage-students-btn').addEventListener('click', () => {
        // Navigate to student management
        window.location.hash = `#/class/${this.classData._id}/students`;
      });
  
      return container;
    }
  }