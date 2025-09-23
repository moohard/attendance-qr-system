import axios from 'axios';
import { config } from '../config/env';
import type { LoginCredentials, RegisterData, User, Attendance, AttendanceType, Activity } from '../types';

export type ActivityFormData = Omit<Activity, 'id' | 'created_by'>;

export const api = axios.create({
    baseURL: config.API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            window.location.href = '/login';
        }

        const errorMessage = error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            'Network error occurred';

        return Promise.reject(new Error(errorMessage));
    }
);

// Auth API
export const authAPI = {
    login: async (credentials: LoginCredentials): Promise<{ user: User; access_token: string }> => {
        const response = await api.post('/login', credentials);
        return response.data;
    },

    register: async (userData: RegisterData): Promise<{ user: User; token: string }> => {
        const response = await api.post('/register', userData);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/logout');
    },

    getProfile: async (): Promise<User> => {
        const response = await api.get('/user');
        return response.data;
    },
};

// Attendance API
export const attendanceAPI = {
    checkIn: async (data: {
        qr_content: string;
        attendance_type_id: number;
        latitude?: number;
        longitude?: number;
        notes?: string;
    }): Promise<Attendance> => {
        const response = await api.post('/attendance/check-in', data);
        return response.data;
    },

    checkOut: async (attendanceId: number, data: {
        latitude?: number;
        longitude?: number;
        notes?: string;
    }): Promise<Attendance> => {
        const response = await api.post(`/attendance/check-out/${attendanceId}`, data);
        return response.data;
    },

    getActive: async (): Promise<{ active_attendances: Attendance[] }> => {
        const response = await api.get('/attendance/active');
        return response.data;
    },

    getHistory: async (params?: {
        start_date?: string;
        end_date?: string;
    }): Promise<{ history: Attendance[] }> => {
        const response = await api.get('/attendance/history', { params });
        return response.data;
    },

    getTypes: async (): Promise<{ attendance_types: AttendanceType[] }> => {
        const response = await api.get('/attendance/types');
        return response.data;
    },
};

// Utility function untuk handle API errors
export const handleApiError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error; // ✅ Handle string errors
    }
    return 'An unexpected error occurred';
};
export const activityAPI = {
    // Untuk user biasa (hanya kegiatan aktif)
    getPublicActivities: async (): Promise<Activity[]> => {
        const response = await api.get('/activities');
        return response.data.activities;
    },
    // Untuk admin (semua kegiatan)
    getAdminActivities: async (): Promise<Activity[]> => {
        const response = await api.get('/admin/activities');
        return response.data.data; // Mengambil dari object paginasi
    },
    create: async (data: ActivityFormData): Promise<Activity> => {
        const response = await api.post('/admin/activities', data);
        return response.data;
    },
    update: async (id: number, data: Partial<ActivityFormData>): Promise<Activity> => {
        const response = await api.put(`/admin/activities/${id}`, data);
        return response.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/activities/${id}`);
    },
    getActivities: async (): Promise<Activity[]> => {
        const response = await api.get('/activities');
        return response.data.activities;
    }
};
export const qrAPI = {
    generateForActivity: async (activityId: number): Promise<{ qr_code_svg: string, expires_at: string }> => {
        const response = await api.get(`/qr-code/activity/${activityId}`);
        return response.data;
    }
};