import ExamAPI from '../api/examAPI.js';

class ExamState {
    constructor() {
        this.currentExam = null;
        this.stats = null;
        this.recentExams = [];
        this.recentSubmissions = [];
        this.listeners = new Set();
    }

    addListener(callback) {
        this.listeners.add(callback);
    }

    removeListener(callback) {
        this.listeners.delete(callback);
    }

    notifyListeners() {
        const state = {
            currentExam: this.currentExam,
            stats: this.stats,
            recentExams: this.recentExams,
            recentSubmissions: this.recentSubmissions
        };
        this.listeners.forEach(callback => callback(state));
    }

    setCurrentExam(exam) {
        this.currentExam = exam;
        this.notifyListeners();
    }

    async saveExam(examData) {
        try {
            console.log('Saving exam with data:', examData);
            const response = await ExamAPI.createExam(examData);
            console.log('Save exam response:', response);
            this.setCurrentExam(response);
            return response;
        } catch (error) {
            console.error('Save exam error:', error);
            throw error;
        }
    }

    async publishExam(examId) {
        try {
            const response = await ExamAPI.publishExam(examId);
            if (!response.success) {
                throw new Error(response.error || 'Failed to publish exam');
            }
            // Update current exam if it matches the published exam
            if (this.currentExam && this.currentExam._id === examId) {
                this.setCurrentExam({
                    ...this.currentExam,
                    status: 'published'
                });
            }
            // Refresh recent exams
            await this.getRecentExams();
            return response.data;
        } catch (error) {
            console.error('Publish exam error:', error);
            throw error;
        }
    }

    async getStats() {
        try {
            const stats = await ExamAPI.getStats();
            this.stats = stats;
            this.notifyListeners();
            return stats;
        } catch (error) {
            console.error('Get stats error:', error);
            throw error;
        }
    }

    async getRecentExams() {
        try {
            const recentExams = await ExamAPI.getRecentExams();
            this.recentExams = recentExams;
            this.notifyListeners();
            return recentExams;
        } catch (error) {
            console.error('Get recent exams error:', error);
            throw error;
        }
    }
}

export default new ExamState();