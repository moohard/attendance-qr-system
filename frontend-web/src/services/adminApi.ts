import { api, handleApiError } from './api';
import type { User, UserStats, AttendanceStats, Report, PaginatedResponse, Attendance, ReportFilters, ReportGenerationRequest, AttendanceFilters } from '../types';

export const adminAPI = {
    // User Management
    getUsers: async (page = 1, perPage = 10, search = ''): Promise<PaginatedResponse<User>> => {
        const response = await api.get('/admin/users', {
            params: { page, per_page: perPage, search }
        });
        return response.data;
    },

    createUser: async (userData: Partial<User>): Promise<User> => {
        const response = await api.post('/admin/users', userData);
        return response.data;
    },

    updateUser: async (userId: number, userData: Partial<User>): Promise<User> => {
        const response = await api.put(`/admin/users/${userId}`, userData);
        return response.data;
    },

    deleteUser: async (userId: number): Promise<void> => {
        await api.delete(`/admin/users/${userId}`);
    },

    // Statistics
    getUserStats: async (): Promise<UserStats> => {
        const response = await api.get('/admin/stats/users');
        return response.data;
    },

    getAttendanceStats: async (): Promise<AttendanceStats> => {
        const response = await api.get('/admin/stats/attendance');
        return response.data;
    },

    // Attendance Management
    getAllAttendances: async (page = 1, perPage = 10, filters = {}): Promise<PaginatedResponse<Attendance>> => {
        const response = await api.get('/admin/attendances', {
            params: { page, per_page: perPage, ...filters }
        });
        return response.data;
    },
    getReports: async (page = 1, perPage = 10, filters: ReportFilters = {}): Promise<PaginatedResponse<Report>> => {
        const response = await api.get('/admin/reports', {
            params: { page, per_page: perPage, ...filters }
        });
        return response.data;
    },

    generateReport: async (data: ReportGenerationRequest): Promise<Report> => {
        const response = await api.post('/admin/reports/generate', data);
        return response.data;
    },

    downloadReport: async (reportId: number): Promise<Blob> => {
        const response = await api.get(`/admin/reports/${reportId}/download`, {
            responseType: 'blob'
        });
        return response.data;
    },

    signReport: async (reportId: number, signatureData: string): Promise<Report> => {
        const response = await api.post(`/admin/reports/${reportId}/sign`, {
            signature_data: signatureData
        });
        return response.data;
    },

    // Attendance Management
    getAttendances: async (page = 1, perPage = 10, filters: AttendanceFilters = {}): Promise<PaginatedResponse<Attendance>> => {
        const response = await api.get('/admin/attendances', {
            params: { page, per_page: perPage, ...filters }
        });
        return response.data;
    },

    updateAttendance: async (attendanceId: number, data: Partial<Attendance>): Promise<Attendance> => {
        const response = await api.put(`/admin/attendances/${attendanceId}`, data);
        return response.data;
    },

    deleteAttendance: async (attendanceId: number): Promise<void> => {
        await api.delete(`/admin/attendances/${attendanceId}`);
    },

    exportAttendances: async (filters: AttendanceFilters = {}, format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
        const response = await api.get('/admin/attendances/export', {
            params: { ...filters, format },
            responseType: 'blob'
        });
        return response.data;
    }
};