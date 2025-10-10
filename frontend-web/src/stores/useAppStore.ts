import { create } from 'zustand';
import { attendanceAPI, activityAPI, handleApiError, qrAPI } from '../services/api';
import toast from 'react-hot-toast';
import type { Attendance, AttendanceType, Activity, ActivityFormData } from '../types';

interface QrCodeResponse {
    qr_code_svg: string;
    expires_at: string;
}
interface AppState {
    // State
    attendances: Attendance[];
    attendanceTypes: AttendanceType[];
    activities: Activity[];
    isLoading: boolean;
    error: string | null;

    // Actions
    loadAttendanceTypes: () => Promise<void>;
    loadActiveAttendances: () => Promise<void>;
    loadPublicActivities: () => Promise<void>;
    loadAllActivities: () => Promise<void>;
    loadAttendanceHistory: (startDate?: string, endDate?: string) => Promise<void>;
    checkIn: (data: Parameters<typeof attendanceAPI.checkIn>[0]) => Promise<{ success: boolean }>;
    checkOut: (attendanceId: number, data: Parameters<typeof attendanceAPI.checkOut>[1]) => Promise<{ success: boolean }>;
    generateActivityQrCode: (activityId: number) => Promise<QrCodeResponse | null>;
    createActivity: (data: ActivityFormData) => Promise<void>;
    updateActivity: (id: number, data: Partial<ActivityFormData>) => Promise<void>;
    deleteActivity: (id: number) => Promise<void>;
}

export const useAppStore = create<AppState>()((set, get) => ({
    attendances: [],
    attendanceTypes: [],
    activities: [],
    isLoading: false,
    error: null,

    // --- ACTIONS ---

    loadAttendanceTypes: async () => {
        // Don't re-fetch if data already exists.  This assumes attendanceTypes are static.
        if (get().attendanceTypes.length > 0) return;

        set({ isLoading: true, error: null });
        try {
            const response = await attendanceAPI.getTypes();
            set({ attendanceTypes: response.attendance_types });
        } catch (err) {
            const errorMsg = handleApiError(err);
            set({ error: errorMsg });
            toast.error(errorMsg);
        } finally {
            set({ isLoading: false });
        }
    },
    loadAttendanceHistory: async (startDate?: string, endDate?: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await attendanceAPI.getHistory({ start_date: startDate, end_date: endDate });
            set({ attendances: Array.isArray(response.history.data) ? response.history.data : [] });
        } catch (err) {
            const errorMsg = handleApiError(err);
            set({ error: errorMsg });
            toast.error(errorMsg);
        } finally {
            set({ isLoading: false });
        }
    },
    loadActiveAttendances: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await attendanceAPI.getActive();
            set({ attendances: Array.isArray(response.active_attendances) ? response.active_attendances : [] });
        } catch (err) {
            const errorMsg = handleApiError(err);
            set({ error: errorMsg });
            toast.error(errorMsg);
        } finally {
            set({ isLoading: false });
        }
    },

    loadPublicActivities: async () => {
        set({ isLoading: true, error: null });
        try {
            const activities = await activityAPI.getPublicActivities();
            set({ activities });
        } catch (err) {
            const errorMsg = handleApiError(err);
            set({ error: errorMsg });
            toast.error(errorMsg);
        } finally {
            set({ isLoading: false });
        }
    },

    loadAllActivities: async () => {
        set({ isLoading: true, error: null });
        try {
            const activities = await activityAPI.getAdminActivities();
            set({ activities });
        } catch (err) {
            const errorMsg = handleApiError(err);
            set({ error: errorMsg });
            toast.error(errorMsg);
        } finally {
            set({ isLoading: false });
        }
    },
    loadActivities: async () => {
        set({ isLoading: true, error: null });
        try {
            const activities = await activityAPI.getActivities();
            set({ activities });
        } catch (err) {
            const errorMsg = handleApiError(err);
            set({ error: errorMsg });
            toast.error(errorMsg);
        } finally {
            set({ isLoading: false });
        }
    },
    checkIn: async (data) => {
        const toastId = toast.loading('Processing Check-in...');
        set({ isLoading: true, error: null });
        try {
            await attendanceAPI.checkIn(data);
            await get().loadActiveAttendances();
            toast.success('Check-in successful!', { id: toastId });
            return { success: true };
        } catch (err) {
            const errorMsg = handleApiError(err);
            set({ error: errorMsg });
            toast.error(`Check-in failed: ${errorMsg}`, { id: toastId });
            return { success: false };
        } finally {
            set({ isLoading: false });
        }
    },

    checkOut: async (attendanceId, data) => {
        const toastId = toast.loading('Processing Check-out...');
        set({ isLoading: true, error: null });
        try {
            await attendanceAPI.checkOut(attendanceId, data);
            await get().loadActiveAttendances();
            toast.success('Check-out successful!', { id: toastId });
            return { success: true };
        } catch (err) {
            const errorMsg = handleApiError(err);
            set({ error: errorMsg });
            toast.error(`Check-out failed: ${errorMsg}`, { id: toastId });
            return { success: false };
        } finally {
            set({ isLoading: false });
        }
    },
    generateActivityQrCode: async (activityId: number) => {
        const toastId = toast.loading('Generating QR Code...');
        set({ isLoading: true, error: null });
        try {
            const response = await qrAPI.generateForActivity(activityId);
            toast.success('QR Code generated!', { id: toastId });
            return response;
        } catch (err) {
            const errorMsg = handleApiError(err);
            set({ error: errorMsg });
            toast.error(`Failed to generate QR Code: ${errorMsg}`, { id: toastId });
            return null;
        } finally {
            set({ isLoading: false });
        }
    },
    createActivity: async (data) => {
        const toastId = toast.loading('Membuat kegiatan...');
        set({ isLoading: true });
        try {
            await activityAPI.create(data);
            await get().loadAllActivities();
            toast.success('Kegiatan berhasil dibuat!', { id: toastId });
        } catch (err) {
            const errorMsg = handleApiError(err);
            toast.error(`Gagal: ${errorMsg}`, { id: toastId });
        } finally {
            set({ isLoading: false });
        }
    },

    updateActivity: async (id, data) => {
        const toastId = toast.loading('Memperbarui kegiatan...');
        set({ isLoading: true });
        try {
            await activityAPI.update(id, data);
            await get().loadAllActivities();
            toast.success('Kegiatan berhasil diperbarui!', { id: toastId });
        } catch (err) {
            const errorMsg = handleApiError(err);
            toast.error(`Gagal: ${errorMsg}`, { id: toastId });
        } finally {
            set({ isLoading: false });
        }
    },

    deleteActivity: async (id) => {
        const toastId = toast.loading('Menghapus kegiatan...');
        set({ isLoading: true });
        try {
            await activityAPI.delete(id);
            // Optimistic update: hapus dari state sebelum fetch ulang
            set(state => ({ activities: state.activities.filter(a => a.id !== id) }));
            toast.success('Kegiatan berhasil dihapus!', { id: toastId });
        } catch (err) {
            const errorMsg = handleApiError(err);
            toast.error(`Gagal: ${errorMsg}`, { id: toastId });
            await get().loadAllActivities(); // Refresh jika gagal
        } finally {
            set({ isLoading: false });
        }
    },
}));

