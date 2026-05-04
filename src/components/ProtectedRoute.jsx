import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
    const { user, role, loading } = useAuth();

    // Only proceed if loading is finished AND we have a role resolved (if user exists)
    if (loading || (user && role === null)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role !== 'admin') {
        // If logged in but not an admin, send back to home
        return <Navigate to="/" replace />;
    }

    return children;
}
