export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const isToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
};