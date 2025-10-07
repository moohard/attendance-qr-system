export const config = {
    API_URL: import.meta.env.VITE_API_URL || 'http://10.10.20.251:9001/api',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'Attendance QR System',
} as const;