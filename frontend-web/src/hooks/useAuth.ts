import { useState, useEffect, useCallback } from 'react';
// useNavigate DIHAPUS dari sini
import { authAPI, handleApiError } from '../services/api';
import toast from 'react-hot-toast';
import type { User, LoginCredentials } from '../types';

// Definisikan tipe untuk return value dari fungsi login
// Sekarang kita kembalikan juga data user agar bisa digunakan untuk navigasi
type LoginResult = {
  success: true;
  user: User;
} | {
  success: false;
  error: string;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      localStorage.removeItem('user_data'); // Hapus data yang rusak
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  // useNavigate DIHAPUS dari sini

  const checkAuth = useCallback(async () => {
    // ... (fungsi ini tidak berubah)
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      const freshUser = await authAPI.getProfile();
      setUser(freshUser);
      localStorage.setItem('user_data', JSON.stringify(freshUser));
    } catch (error) {
      console.error('Auth check failed, logging out:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      setIsLoading(true);
      const { user: userData, access_token } = await authAPI.login(credentials);

      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);

      toast.success(`Welcome back, ${userData.name}!`);

      // Logika navigasi DIHAPUS dari sini

      // Kembalikan data user agar komponen bisa menavigasi
      return { success: true as const, user: userData };
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      return {
        success: false as const,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (navigate: (path: string) => void) => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed, proceeding with client-side logout:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
      toast.success('You have been logged out.');
      // Arahkan ke halaman login menggunakan fungsi navigate dari komponen
      navigate('/login');
    }
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };
};

