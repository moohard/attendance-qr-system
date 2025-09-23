export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    qr_code: string;
    is_honorer: boolean;
    created_at: string;
    updated_at: string;
}

export interface Attendance {
    user: unknown;
    id: number;
    user_id: number;
    attendance_type_id: number;
    check_in: string;
    check_out: string | null;
    latitude: number | null;
    longitude: number | null;
    notes: string | null;
    is_late: boolean;
    is_early: boolean;
    created_at: string;
    updated_at: string;
    attendance_type?: AttendanceType;
}

export interface AttendanceType {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    message?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role?: 'admin' | 'user';
    is_honorer?: boolean;
}

export interface UserStats {
    total_users: number;
    active_users: number;
    honorer_users: number;
    admin_users: number;
}

export interface AttendanceStats {
    total_checkins: number;
    today_checkins: number;
    late_checkins: number;
    early_checkouts: number;
}

export interface Report {
    id: number;
    period: string;
    attendance_type_id: number;
    file_path: string;
    is_signed: boolean;
    signed_at: string | null;
    signature_data: string | null;
    created_at: string;
    updated_at: string;
    attendance_type?: AttendanceType;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface ReportFilters {
    period?: string;
    attendance_type_id?: number;
    is_signed?: boolean;
    start_date?: string;
    end_date?: string;
}

export interface AttendanceFilters {
    user_id?: number;
    attendance_type_id?: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    is_late?: boolean;
    is_early?: boolean;
}

export interface ReportGenerationRequest {
    period: string;
    attendance_type_id?: number;
    format?: 'pdf' | 'excel';
}
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
export type ActivityFormData = Omit<Activity, 'id' | 'created_by'>;
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