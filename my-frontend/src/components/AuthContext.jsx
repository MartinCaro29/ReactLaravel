import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Initialize user immediately from sessionStorage to prevent flickering during refresh
    const [user, setUser] = useState(() => {
        try {
            const savedUser = sessionStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error('Error parsing user from sessionStorage:', error);
            return null;
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Update sessionStorage whenever user changes
    const updateUserStorage = useCallback((userData) => {
        if (userData) {
            sessionStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.removeItem('loggedOut');
        } else {
            sessionStorage.removeItem('user');
        }
    }, []);

    // Enhanced setUser that also updates storage
    const setUserWithStorage = useCallback((userData) => {
        setUser(userData);
        updateUserStorage(userData);
    }, [updateUserStorage]);

    // Helper functions for role checking
    const isAdmin = useCallback(() => {
        return user?.role === 'admin';
    }, [user]);

    const isManager = useCallback(() => {
        return user?.role === 'manager';
    }, [user]);

    const isUser = useCallback(() => {
        return user?.role === 'user';
    }, [user]);

    const canEditUser = useCallback((targetUser) => {
        if (!user || !targetUser) return false;

        // Admin can edit everyone except themselves
        if (user.role === 'admin') {
            return user.id !== targetUser.id;
        }

        // Manager can edit their subordinates
        if (user.role === 'manager') {
            return targetUser.manager_id === user.id;
        }

        // Regular users can't edit anyone
        return false;
    }, [user]);

    const canDeleteUser = useCallback((targetUser) => {
        return canEditUser(targetUser);
    }, [canEditUser]);

    // Fetch user data
    const fetchUser = useCallback(async () => {
        if (sessionStorage.getItem('loggedOut')) {
            setUserWithStorage(null);
            return;
        }

        try {
            if (!user) {
                setLoading(true);
            }

            await api.get('/sanctum/csrf-cookie');
            const res = await api.get('/api/user');
            const userData = res.data.user || res.data;

            setUserWithStorage(userData);
            setError(null);
        } catch (err) {
            if (err.response?.status === 401) {
                setUserWithStorage(null);
                setError('Session expired. Please login again.');
                sessionStorage.setItem('loggedOut', 'true');
            } else {
                setError('Failed to fetch user data');
            }
        } finally {
            setLoading(false);
        }
    }, [user, setUserWithStorage]);

    // Login method
    const login = async (email, password, remember = false) => {
        setLoading(true);
        try {
            await api.get('/sanctum/csrf-cookie');
            const res = await api.post('/api/login', {
                email,
                password,
                remember
            });

            const userData = res.data.user || res.data;
            setUserWithStorage(userData);
            setError(null);
            sessionStorage.removeItem('loggedOut');
            return res.data;
        } catch (err) {
            setUserWithStorage(null);
            if (err.response) {
                setError(err.response.data.error || 'Login failed');
                throw err;
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
            await api.post('/api/logout');
        } catch (err) {
            console.error('Logout API call failed:', err);
        } finally {
            setUserWithStorage(null);
            setError(null);
            sessionStorage.setItem('loggedOut', 'true');
            setLoading(false);
        }
    };

    // Background validation
    useEffect(() => {
        const shouldFetch = !user && !sessionStorage.getItem('loggedOut');

        if (shouldFetch) {
            fetchUser();
        }
    }, []);

    // Periodic session validation
    useEffect(() => {
        if (user) {
            const validateSession = async () => {
                try {
                    await api.get('/sanctum/csrf-cookie');
                    const res = await api.get('/api/user');
                    const userData = res.data.user || res.data;

                    // Update user data if it has changed (e.g., role updated by admin)
                    if (JSON.stringify(userData) !== JSON.stringify(user)) {
                        setUserWithStorage(userData);
                    }
                } catch (err) {
                    if (err.response?.status === 401) {
                        setUserWithStorage(null);
                        sessionStorage.setItem('loggedOut', 'true');
                    }
                }
            };

            const interval = setInterval(validateSession, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [user, setUserWithStorage]);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            login,
            logout,
            fetchUser,
            setUser: setUserWithStorage,
            // Role checking helpers
            isAdmin,
            isManager,
            isUser,
            canEditUser,
            canDeleteUser
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
