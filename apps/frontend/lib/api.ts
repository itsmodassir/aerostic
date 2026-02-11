import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1', // Relative path for Nginx proxying
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookie-based auth
});

// Request interceptor to automatically add the tenant ID from the URL
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const workspaceMatch = path.match(/\/dashboard\/([0-9a-f-]{36})/i);
        if (workspaceMatch) {
            config.headers['x-tenant-id'] = workspaceMatch[1];
        }
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
