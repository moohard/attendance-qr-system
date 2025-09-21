import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: 'admin' | 'user';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};