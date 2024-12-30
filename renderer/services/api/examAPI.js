class ExamAPI {
    static async createExam(examData) {
        try {
            const response = await window.api.createExam(examData);
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to create exam');
            }
        } catch (error) {
            console.error('Create exam error:', error);
            throw error;
        }
    }

    static async publishExam(examId) {
        try {
            const response = await window.api.publishExam(examId);
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to publish exam');
            }
        } catch (error) {
            console.error('Publish exam error:', error);
            throw error;
        }
    }

    static async getExams() {
        try {
            const response = await window.api.getExams();
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch exams');
            }
        } catch (error) {
            console.error('Get exams error:', error);
            throw error;
        }
    }

    static async getExamById(examId) {
        try {
            const response = await window.api.getExamById(examId);
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch exam');
            }
        } catch (error) {
            console.error('Get exam by ID error:', error);
            throw error;
        }
    }

    // Added Methods

    static async getStats() {
        try {
            const response = await window.api.getExamStats();
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch stats');
            }
        } catch (error) {
            console.error('Get stats error:', error);
            throw error;
        }
    }

    static async getRecentExams() {
        try {
            const response = await window.api.getRecentExams();
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch recent exams');
            }
        } catch (error) {
            console.error('Get recent exams error:', error);
            throw error;
        }
    }

    static async getRecentSubmissions() {
        try {
            const response = await window.api.getRecentSubmissions();
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to fetch recent submissions');
            }
        } catch (error) {
            console.error('Get recent submissions error:', error);
            throw error;
        }
    }
}

export default ExamAPI;