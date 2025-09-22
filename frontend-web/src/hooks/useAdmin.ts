import { useState, useCallback } from 'react';
import { adminAPI } from '../services/adminApi';
import { handleApiError } from '../services/api';
import type { User, UserStats, AttendanceStats, Report, PaginatedResponse } from '../types';

export const useAdmin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // User Management
    const getUsers = useCallback(async (page = 1, perPage = 10, search = '') => {
        try {
            setIsLoading(true);
            setError(null);
            return await adminAPI.getUsers(page, perPage, search);
        } catch (err) {
            const errorMsg = handleApiError(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createUser = useCallback(async (userData: Partial<User>) => {
        try {
            setIsLoading(true);
            setError(null);
            return await adminAPI.createUser(userData);
        } catch (err) {
            const errorMsg = handleApiError(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateUser = useCallback(async (userId: number, userData: Partial<User>) => {
        try {
            setIsLoading(true);
            setError(null);
            return await adminAPI.updateUser(userId, userData);
        } catch (err) {
            const errorMsg = handleApiError(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteUser = useCallback(async (userId: number) => {
        try {
            setIsLoading(true);
            setError(null);
            await adminAPI.deleteUser(userId);
        } catch (err) {
            const errorMsg = handleApiError(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Statistics
    const getUserStats = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            return await adminAPI.getUserStats();
        } catch (err) {
            const errorMsg = handleApiError(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getAttendanceStats = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            return await adminAPI.getAttendanceStats();
        } catch (err) {
            const errorMsg = handleApiError(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Reports
    const getReports = useCallback(async (page = 1, perPage = 10, filters: ReportFilters = {}) => {
        try {
            setIsLoading(true);
            setError(null);
            return await adminAPI.getReports(page, perPage, filters);
        } catch (err) {
            const errorMsg = handleApiError(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const generateReport = useCallback(async (data: ReportGenerationRequest) => {
        try {
            setIsLoading(true);
            setError(null);
            return await adminAPI.generateReport(data);
        } catch (err) {
            const errorMsg = handleApiError(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const downloadReport = useCallback(async (reportId: number) => {
        try {
            setIsLoading(true);
            setError(null);
            return await adminAPI.downloadReport(reportId);
        } catch (err) {
            const errorMsg = handleApiError(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const signReport = useCallback(async (reportId: number, signatureData: string) => {
        try {
            setIsLoading(true);
            setError(null);
            return await adminAPI.signReport(reportId, signatureData);
        } catch (err) {
            const errorMsg = handleApiError(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Attendance Management
    const getAttendances = useCallback(async (page = 1, perPage = 10, filters: AttendanceFilters = {}) => {
        try {
            setIsLoading(true);
            setError(null);
            return await adminAPI.getAttendances(page, perPage, filters);
        } catch (err) {
            const errorMsg = handleApiError(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateAttendance = useCallback(async (attendanceId: number, data: Partial<Attendance>) => {
        try {
            setIsLoading(true);
            setError(null);
            return await adminAPI.updateAttendance(attendanceId, data);
        } catch (err) {
            const errorMsg = handleApiError(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteAttendance = useCallback(async (attendanceId: number) => {
        try {
            setIsLoading(true);
            setError(null);
            await adminAPI.deleteAttendance(attendanceId);
        } catch (err) {
            const errorMsg = handleApiError(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const exportAttendances = useCallback(async (filters: AttendanceFilters = {}, format: 'csv' | 'excel' = 'csv') => {
        try {
            setIsLoading(true);
            setError(null);
            return await adminAPI.exportAttendances(filters, format);
        } catch (err) {
            const errorMsg = handleApiError(err);
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);


    return {
        isLoading,
        error,
        getUsers,
        createUser,
        updateUser,
        deleteUser,
        getUserStats,
        getAttendanceStats,
        getReports,
        generateReport,
        downloadReport,
        signReport,
        getAttendances,
        updateAttendance,
        deleteAttendance,
        exportAttendances,
    };
};