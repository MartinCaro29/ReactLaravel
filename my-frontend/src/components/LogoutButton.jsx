import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Import the useAuth hook

const LogoutButton = () => {
    const navigate = useNavigate();
    const { logout } = useAuth(); // Use the logout method from AuthContext

    const handleLogout = async () => {
        try {
            await logout(); // This will call the AuthContext logout method
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Even if API call fails, still navigate to login
            navigate('/login');
        }
    };

    return (
        <button className="btn btn-danger" onClick={handleLogout}>
            Dil
        </button>
    );
};

export default LogoutButton;
