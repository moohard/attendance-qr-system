import { useState, useCallback } from 'react';
import { api } from '../services/api';

export interface Activity {
    id: number;
    name: string;
    description: string;
    start_time: string;
    end_time: string;
    is_recurring: boolean;
    recurring_days: number[];
    valid_from: string;
    valid_to: string;
    is_active: boolean;
    created_by: number;
}

export interface ActivityAttendance {
    id: number;
    activity_id: number;
    user_id: number;
    check_in: string;
    check_out: string | null;
    latitude: number | null;
    longitude: number | null;
    notes: string | null;
    is_late: boolean;
    is_early: boolean;
    activity?: Activity;
}

export const useActivity = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getActivities = useCallback(async (currentOnly = true) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.get('/activities', {
                params: { current: currentOnly }
            });

            return response.data.activities;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const checkInToActivity = useCallback(async (qrContent: string, location?: { latitude: number; longitude: number }, notes?: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.post('/activities/checkin', {
                qr_content: qrContent,
                latitude: location?.latitude,
                longitude: location?.longitude,
                notes
            });

            return response.data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const checkOutFromActivity = useCallback(async (attendanceId: number, location?: { latitude: number; longitude: number }, notes?: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.post(`/activities/checkout/${attendanceId}`, {
                latitude: location?.latitude,
                longitude: location?.longitude,
                notes
            });

            return response.data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getMyAttendances = useCallback(async (filters?: { startDate?: string; endDate?: string; activityId?: number }) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.get('/activities/my-attendances', {
                params: filters
            });

            return response.data.attendances;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const generateActivityQr = useCallback(async (activityId: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await api.get(`/activities/${activityId}/qr`);
            return response.data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        getActivities,
        checkInToActivity,
        checkOutFromActivity,
        getMyAttendances,
        generateActivityQr,
    };
};