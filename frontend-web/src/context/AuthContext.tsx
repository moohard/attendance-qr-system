import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { authAPI, handleApiError } from '../services/api';
import toast from 'react-hot-toast';
import type { User, LoginCredentials } from '../types';

// Tipe untuk return value dari fungsi login
type LoginResult = {
    success: true;
    user: User;
} | {
    success: false;
    error: string;
};

// Tipe untuk hook useAuth internal
type AuthHookResult = {
    user: User | null;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<LoginResult>;
    logout: () => Promise<void>; // Logout tidak lagi butuh navigate
    isAuthenticated: boolean;
};


const useAuthHook = (): AuthHookResult => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const userData = localStorage.getItem('user_data');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error("Failed to parse user data from localStorage", error);
            localStorage.removeItem('user_data');
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = useCallback(async () => {
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
            console.error('Auth check failed, clearing session:', error);
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
        // ... (Fungsi login tidak berubah)
        try {
            setIsLoading(true);
            const { user: userData, access_token } = await authAPI.login(credentials);

            localStorage.setItem('auth_token', access_token);
            localStorage.setItem('user_data', JSON.stringify(userData));
            setUser(userData);

            toast.success(`Welcome back, ${userData.name}!`);

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

    // --- PERUBAHAN DI SINI ---
    // Logout sekarang lebih sederhana
    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout API call failed, proceeding with client-side logout:', error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            setUser(null);
            toast.success('You have been logged out.');
            // Navigasi dihapus dari sini
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

// --- Sisa file ini tidak berubah ---
const AuthContext = createContext<AuthHookResult | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const auth = useAuthHook();
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthHookResult => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

