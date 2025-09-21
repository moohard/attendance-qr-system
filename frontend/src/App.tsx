import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
// Component
import { Layout } from './components/layout/Layout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AttendancePage } from './pages/AttendancePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ReportsManagementPage } from './pages/admin/ReportsManagementPage';
import { AttendanceManagementPage } from './pages/admin/AttendanceManagementPage';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="/admin" element={<Layout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="reports" element={<ReportsManagementPage />} />
          <Route path="attendance" element={<AttendanceManagementPage />} />
          <Route path="settings" element={<div>Settings - Coming Soon</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;