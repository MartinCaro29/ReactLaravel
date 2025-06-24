import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AuthRedirect = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading...</p>;
    if (user) return <Navigate to="/dashboard" />;

    return children;
};

export default AuthRedirect;
