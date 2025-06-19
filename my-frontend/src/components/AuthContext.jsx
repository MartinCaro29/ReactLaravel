import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../api'; // Import your centralized Axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user data
    const fetchUser = useCallback(async () => {
        try {
            // First get CSRF cookie for Sanctum
            await api.get('/sanctum/csrf-cookie');

            const res = await api.get('/api/user');
            setUser(res.data.user || res.data);
            setError(null);
        } catch (err) {
            setUser(null);
            if (err.response?.status === 401) {
                setError('Session expired. Please login again.');
            } else {
                setError('Failed to fetch user data');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Login method
    const login = async (email, password, remember = false) => {
        setLoading(true);
        try {
            // First get CSRF cookie
            await api.get('/sanctum/csrf-cookie');

            const res = await api.post('/api/login', {
                email,
                password,
                remember
            });

            setUser(res.data.user || res.data);
            setError(null);
            return res.data;
        } catch (err) {
            setUser(null);
            if (err.response) {
                setError(err.response.data.error || 'Login failed');
                throw err.response.data;
            }
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Logout method
    const logout = async () => {
        setLoading(true);
        try {
            // Call the logout API endpoint
            await api.post('/api/logout');

            // Clear user state immediately
            setUser(null);
            setError(null);

            // Clear any localStorage items if you're using them
            localStorage.removeItem('userId');
            localStorage.setItem('loggedOut', 'true');

        } catch (err) {
            console.error('Logout API call failed:', err);
            // Even if API call fails, clear the user state locally
            setUser(null);
            setError(null);
            localStorage.removeItem('userId');
            localStorage.setItem('loggedOut', 'true');
        } finally {
            setLoading(false);
        }
    };

    // Check for logout flag and clear user state
    useEffect(() => {
        if (localStorage.getItem('loggedOut')) {
            setUser(null);
            localStorage.removeItem('loggedOut');
        } else {
            fetchUser();
        }
    }, [fetchUser]);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            login,
            logout,
            fetchUser,
            setUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
