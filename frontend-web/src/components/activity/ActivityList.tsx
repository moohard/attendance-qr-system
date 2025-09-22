import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Activity } from '../../hooks/useActivity';

interface ActivityListProps {
    activities: Activity[];
    onGenerateQr: (activityId: number) => void;
    userRole: string;
}

export const ActivityList: React.FC<ActivityListProps> = ({
    activities,
    onGenerateQr,
    userRole,
}) => {
    const formatTime = (timeString: string) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRecurringDays = (days: number[]) => {
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return days.map(day => dayNames[day]).join(', ');
    };

    return (
        <div className="grid gap-4">
            {activities.map((activity) => (
                <Card key={activity.id}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">{activity.name}</h3>
                            {userRole === 'admin' && (
                                <Button
                                    size="sm"
                                    onClick={() => onGenerateQr(activity.id)}
                                >
                                    Generate QR
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">{activity.description}</p>

                            <div className="flex justify-between text-sm">
                                <span>Waktu: {formatTime(activity.start_time)} - {formatTime(activity.end_time)}</span>
                                <span className={activity.is_active ? 'text-green-600' : 'text-red-600'}>
                                    {activity.is_active ? 'Aktif' : 'Tidak Aktif'}
                                </span>
                            </div>

                            {activity.is_recurring && activity.recurring_days && (
                                <p className="text-sm text-gray-500">
                                    Hari: {getRecurringDays(activity.recurring_days)}
                                </p>
                            )}

                            {activity.valid_from && activity.valid_to && (
                                <p className="text-sm text-gray-500">
                                    Periode: {new Date(activity.valid_from).toLocaleDateString('id-ID')} -{' '}
                                    {new Date(activity.valid_to).toLocaleDateString('id-ID')}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};