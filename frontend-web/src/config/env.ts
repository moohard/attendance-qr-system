const isDevelopment = import.meta.env.MODE === 'development';

export const config = {
    API_URL: isDevelopment ? '/api' : (import.meta.env.VITE_API_URL || 'http://10.10.20.249:8000/api'),
    APP_NAME: import.meta.env.VITE_APP_NAME || 'Attendance QR System',
} as const;