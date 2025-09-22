import { useState, useCallback } from 'react';
import { attendanceAPI } from '../services/api';
import { handleApiError } from '../services/api';
import type { Attendance, AttendanceType } from '../types';
import toast from 'react-hot-toast';

export const useAttendance = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [attendanceTypes, setAttendanceTypes] = useState<AttendanceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAttendanceTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await attendanceAPI.getTypes();
      setAttendanceTypes(response.attendance_types);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadActiveAttendances = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await attendanceAPI.getActive();
      setAttendances(response.active_attendances);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAttendanceHistory = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await attendanceAPI.getHistory({ start_date: startDate, end_date: endDate });
      setAttendances(response.history);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkIn = async (data: Parameters<typeof attendanceAPI.checkIn>[0]) => {
    const toastId = toast.loading('Processing Check-in...');
    try {
      setIsLoading(true);
      setError(null);
      const result = await attendanceAPI.checkIn(data);
      await loadActiveAttendances();
      toast.success('Check-in successful!', { id: toastId });
      return { success: true as const, data: result };
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      toast.error(`Check-in failed: ${errorMsg}`, { id: toastId });
      return { success: false as const, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const checkOut = async (attendanceId: number, data: Parameters<typeof attendanceAPI.checkOut>[1]) => {
    const toastId = toast.loading('Processing Check-out...');
    try {
      setIsLoading(true);
      setError(null);
      const result = await attendanceAPI.checkOut(attendanceId, data);
      await loadActiveAttendances();
      toast.success('Check-out successful!', { id: toastId });
      return { success: true as const, data: result };
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      toast.error(`Check-out failed: ${errorMsg}`, { id: toastId });
      return { success: false as const, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    attendances,
    attendanceTypes,
    isLoading,
    error,
    loadAttendanceTypes,
    loadActiveAttendances,
    loadAttendanceHistory,
    checkIn,
    checkOut,
  };
};
