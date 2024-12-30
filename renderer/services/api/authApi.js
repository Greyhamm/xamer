class AuthAPI {
    static async login(credentials) {
        try {
            // Pass the correct options including endpoint and headers
            const responseData = await window.api.login({
                endpoint: '/auth/login',
                data: credentials,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Received response data:', responseData); // Added log
            console.log('Response success:', responseData.success); // Added log

            // Check if the response indicates a successful login
            if (!responseData.success) {
                throw new Error(responseData.message || 'Login failed');
            }

            // Handle authentication response
            this.handleAuthResponse(responseData);
            return responseData;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    static async signup(userData) {
        try {
            const responseData = await window.api.signup({
                endpoint: '/auth/signup',
                data: userData,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!responseData.success) {
                throw new Error(responseData.message || 'Signup failed');
            }

            this.handleAuthResponse(responseData);
            return responseData;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    static async getProfile() {
        try {
            const responseData = await window.api.getProfile();

            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to fetch profile');
            }

            return responseData;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    static handleAuthResponse(responseData) {
        if (responseData.token) {
            localStorage.setItem('token', responseData.token);
            localStorage.setItem('role', responseData.role);
            console.log('Token and role stored successfully.'); // Added log
        }
    }

    static handleError(error) {
        console.error('Auth API Error:', error);
        const message = error.message || 'Authentication failed. Please try again.';
        return new Error(message);
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.reload();
    }

    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    static getRole() {
        return localStorage.getItem('role');
    }
}

export default AuthAPI;