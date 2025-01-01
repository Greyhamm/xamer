class ExamAPI {
    static async createExam(examData) {
        try {
            console.log('Sending exam data to API:', examData);
            const response = await window.api.createExam(examData);
            console.log('API Response:', response);
            
            if (!response.success) {
                throw new Error(response.error || 'Failed to create exam');
            }
            
            return response.data;
        } catch (error) {
            console.error('Create exam error:', error);
            throw error;
        }
    }

    static async publishExam(examId) {
        try {
            const response = await window.api.publishExam(examId);
            if (!response.success) {
                throw new Error(response.error || 'Failed to publish exam');
            }
            return response;  // Return full response object
        } catch (error) {
            console.error('Publish exam error:', error);
            throw error;
        }
    }

    static async getExams() {
        try {
            const response = await window.api.getExams();
            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch exams');
            }
            return response.data;
        } catch (error) {
            console.error('Get exams error:', error);
            throw error;
        }
    }

    static async getExamById(examId) {
        try {
            const response = await window.api.getExamById(examId);
            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch exam');
            }
            return response.data;
        } catch (error) {
            console.error('Get exam by ID error:', error);
            throw error;
        }
    }

    static async getStats() {
        try {
            const response = await window.api.getExamStats();
            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch stats');
            }
            return response.data;
        } catch (error) {
            console.error('Get stats error:', error);
            throw error;
        }
    }

    static async getRecentExams() {
        try {
            const response = await window.api.getRecentExams();
            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch recent exams');
            }
            return response.data;
        } catch (error) {
            console.error('Get recent exams error:', error);
            throw error;
        }
    }
}

export default ExamAPI;