// src/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
});

// Add CSRF token handling
api.interceptors.request.use(async (config) => {
    if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
        try {
            // First get CSRF cookie
            await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
                withCredentials: true
            });
        } catch (error) {
            console.error('Failed to get CSRF cookie', error);
        }
    }
    return config;
});

export default api;
