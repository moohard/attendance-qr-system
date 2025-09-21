export const config = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:9001/api',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'Attendance QR System',
} as const;