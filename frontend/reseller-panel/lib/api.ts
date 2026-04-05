import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1', // Relative path for Nginx proxying
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookie-based auth
});

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value?: string | null): value is string {
    return !!value && UUID_V4_REGEX.test(value);
}



// Request interceptor to automatically add the tenant ID and Auth Token
api.interceptors.request.use(async (config) => {
    if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const workspaceMatch = path.match(/\/dashboard\/([a-zA-Z0-9-]{1,})/i);
        const candidateWorkspace = workspaceMatch?.[1];

        // Define global endpoints that should NEVER send a tenant ID
        const isGlobalEndpoint =
            config.url === '/tenants' ||
            config.url?.startsWith('/auth/me') ||
            config.url?.startsWith('/auth/workspaces') ||
            config.url?.startsWith('/auth/register') ||
            config.url?.startsWith('/auth/branding');

        if (!isGlobalEndpoint) {
            let tenantId: string | null = null;

            // Only trust URL segment when it's an actual UUID.
            if (isUuid(candidateWorkspace)) {
                tenantId = candidateWorkspace;
            }

            // Fall back to cached UUID for clean URLs.
            if (!tenantId) {
                const savedTenantId = localStorage.getItem('x-tenant-id');
                if (isUuid(savedTenantId)) {
                    tenantId = savedTenantId;
                }
            }
            if (!tenantId) {
                const selectedTenantId = localStorage.getItem('selected_tenant_id');
                if (isUuid(selectedTenantId)) {
                    tenantId = selectedTenantId;
                }
            }

            if (tenantId) {
                config.headers['x-tenant-id'] = tenantId;
                localStorage.setItem('x-tenant-id', tenantId);
                localStorage.setItem('selected_tenant_id', tenantId);
            }
        }

        // Only add Authorization header if token exists in localStorage.
        // If not, rely on HttpOnly cookies via withCredentials: true
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined' && token !== 'null') {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return config;
});

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => {
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('text/html')) {
            console.warn('API returned HTML instead of JSON');
            return Promise.reject(new Error('Invalid API response'));
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If 401 error and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call refresh endpoint
                // Note: AuthController refresh endpoint expects sessionId? 
                // Wait, AuthController.ts: sessionId = req.body.sessionId || req.headers["x-session-id"]
                // We don't have sessionId easily. Let's see if the backend can work without it or if we can get it.
                // In AuthService.ts, sessionId is required to find the session.
                
                await api.post('/auth/refresh', {});
                isRefreshing = false;
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError);
                
                // If refresh fails, redirect to login
                if (typeof window !== 'undefined') {
                    const isLoginPage = window.location.pathname.includes('/login');
                    if (!isLoginPage) {
                        localStorage.clear();
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(refreshError);
            }
        }

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
