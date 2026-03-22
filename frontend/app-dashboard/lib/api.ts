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

async function resolveTenantIdFromSession(): Promise<string | null> {
    try {
        const res = await fetch('/api/v1/auth/me', {
            credentials: 'include',
            cache: 'no-store',
        });
        if (!res.ok) return null;
        const payload = await res.json();
        const tenantId = payload?.tenantId;
        return isUuid(tenantId) ? tenantId : null;
    } catch {
        return null;
    }
}

// Request interceptor to automatically add the tenant ID and Auth Token
api.interceptors.request.use(async (config) => {
    if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const workspaceMatch = path.match(/\/dashboard\/([a-zA-Z0-9-]{1,})/i);
        const candidateWorkspace = workspaceMatch?.[1];

        // Define global endpoints that should NEVER send a tenant ID
        // (so they don't get rejected by the tenant-context middleware)
        const isGlobalEndpoint =
            config.url === '/tenants' ||
            config.url?.startsWith('/auth/me') ||
            config.url?.startsWith('/auth/workspaces') ||
            config.url?.startsWith('/auth/register');

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

            // Last fallback: resolve current tenant context from authenticated profile.
            if (!tenantId) {
                tenantId = await resolveTenantIdFromSession();
            }

            if (tenantId) {
                config.headers['x-tenant-id'] = tenantId;
                localStorage.setItem('x-tenant-id', tenantId);
            }
        }

        const token = localStorage.getItem('token');
        if (token && token !== 'undefined' && token !== 'null') {
            config.headers['Authorization'] = `Bearer ${token}`;
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
