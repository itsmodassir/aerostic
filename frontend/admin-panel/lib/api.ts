import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

const clearAuthStorage = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
};

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve();
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => api(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post('/auth/refresh', {});
                isRefreshing = false;
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError);
                const refreshStatus = (refreshError as any)?.response?.status;
                if (
                    typeof window !== 'undefined' &&
                    (refreshStatus === 401 || refreshStatus === 403) &&
                    !window.location.pathname.startsWith('/login')
                ) {
                    clearAuthStorage();
                    window.location.replace('/login');
                }
                return Promise.reject(refreshError);
            }
        }

        const contentType = error.response?.headers?.['content-type'];
        if (contentType && contentType.includes('text/html')) {
            return Promise.reject(new Error('API endpoint unavailable'));
        }

        return Promise.reject(error);
    }
);

export default api;
