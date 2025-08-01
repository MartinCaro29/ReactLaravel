import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();


    if (!user) return <Navigate to="/login" />;

    return children;
};

export default ProtectedRoute;
