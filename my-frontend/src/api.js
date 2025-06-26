// src/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    }
});

// Add CSRF token handling for all state-changing requests
api.interceptors.request.use(async (config) => {
    // For state-changing methods, ensure we have CSRF cookie
    if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
        try {
            // Get CSRF cookie before making the request
            await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
                withCredentials: true
            });
        } catch (error) {
            console.error('Failed to get CSRF cookie', error);
        }
    }
    return config;
});

// Handle authentication errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            // Redirect to login if unauthenticated
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
