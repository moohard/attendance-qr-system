import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { useAuth } from '../context/AuthContext'; // 2. Pastikan import dari context
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@attendance.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate(); // 3. Panggil hook useNavigate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await login({ email, password });

    // --- PERBAIKAN DI SINI ---
    // 4. Jika login berhasil, lakukan navigasi secara eksplisit
    if (result.success) {
      // Arahkan berdasarkan peran (role) dari data pengguna yang dikembalikan
      navigate(result.user.role === 'admin' ? '/admin' : '/attendance');
    } else {
      // Jika gagal, tampilkan error
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-center text-gray-900">
              Attendance QR System
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to your account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                Sign in
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Demo Credentials</span>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-600">
                <p>Email: admin@attendance.com</p>
                <p>Password: password123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

