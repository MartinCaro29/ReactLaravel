import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AuthRedirect = ({ children }) => {
    const { user } = useAuth(); // Remove loading check entirely

    if (user) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

export default AuthRedirect;
