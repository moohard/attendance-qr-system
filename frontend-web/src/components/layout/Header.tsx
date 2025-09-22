import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { useAuth } from '../../context/AuthContext'; // 2. Pastikan import dari context
import { Button } from '../ui/Button';

export const Header = () => {

  const { user, logout } = useAuth();
  const navigate = useNavigate(); // 4. Dapatkan fungsi navigate

  const handleLogout = async () => {
    await logout(); // 5. Panggil fungsi logout (tanpa argumen)
    navigate('/login'); // 6. Lakukan navigasi setelah logout selesai
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Attendance QR System</h1>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Welcome, {user?.name}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};