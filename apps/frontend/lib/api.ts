import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', // Backend URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add a response interceptor to handle non-JSON responses
api.interceptors.response.use(
    (response) => {
        // Check if response is HTML instead of JSON (error page)
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('text/html')) {
            console.warn('API returned HTML instead of JSON');
            return Promise.reject(new Error('Invalid API response'));
        }
        return response;
    },
    (error) => {
        // Handle network errors and non-JSON responses gracefully
        if (error.response) {
            const contentType = error.response.headers['content-type'];
            if (contentType && contentType.includes('text/html')) {
                console.warn('API error returned HTML - endpoint may not exist');
                return Promise.reject(new Error('API endpoint unavailable'));
            }
        }
        return Promise.reject(error);
    }
);

export default api;
