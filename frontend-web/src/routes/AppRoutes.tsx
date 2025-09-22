import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { Layout } from '../components/layout/Layout';

// Pages
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AttendancePage } from '../pages/AttendancePage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { ReportsManagementPage } from '../pages/admin/ReportsManagementPage';
import { AttendanceManagementPage } from '../pages/admin/AttendanceManagementPage';

export const AppRoutes = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />}
            />

            {/* Rute untuk semua user yang sudah login */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="attendance" element={<AttendancePage />} />
            </Route>

            {/* Rute khusus admin */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<AdminDashboardPage />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="reports" element={<ReportsManagementPage />} />
                <Route path="attendance" element={<AttendanceManagementPage />} />
                <Route path="settings" element={<div>Settings - Coming Soon</div>} />
            </Route>

            {/* Fallback untuk rute yang tidak ditemukan */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
    );
};
