import { useState, useCallback } from 'react';
import { attendanceAPI } from '../services/api';
import { handleApiError } from '../services/api';
import type { Attendance, AttendanceType } from '../types';

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
    try {
      setIsLoading(true);
      setError(null);
      const attendance = await attendanceAPI.checkIn(data);
      await loadActiveAttendances();
      return { success: true as const, data: attendance };
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      return { success: false as const, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const checkOut = async (attendanceId: number, data: Parameters<typeof attendanceAPI.checkOut>[1]) => {
    try {
      setIsLoading(true);
      setError(null);
      const attendance = await attendanceAPI.checkOut(attendanceId, data);
      await loadActiveAttendances();
      return { success: true as const, data: attendance };
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
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