import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatTime } from '../../utils/date';
import type { Activity } from '../../types';

interface ActivityListProps {
    activities: Activity[];
    title: string;
    onGenerateQr?: (activityId: number) => void;
    onEdit?: (activity: Activity) => void;
    onDelete?: (activityId: number) => void;
    isAdmin: boolean;
}

const getRecurringDays = (days: number[] = []) => {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    if (!days || days.length === 0) return 'N/A';
    return days.map(day => dayNames[day]).join(', ');
};

export const ActivityList = ({ activities, title, onGenerateQr, onEdit, onDelete, isAdmin }: ActivityListProps) => {
    if (activities.length === 0) {
        return (
            <Card>
                <CardHeader><h3 className="text-lg font-semibold text-gray-900">{title}</h3></CardHeader>
                <CardContent><p className="text-gray-500 text-center py-4">Tidak ada kegiatan yang tersedia.</p></CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg border"
                        >
                            <div className="flex-1 mb-3 sm:mb-0">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                    {activity.name}
                                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${activity.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {activity.is_active ? 'Aktif' : 'Non-Aktif'}
                                    </span>
                                </h4>
                                <p className="text-sm text-gray-600">{activity.description}</p>
                                <div className="text-xs text-gray-500 mt-1 space-x-3">
                                    <span>Waktu: {formatTime(activity.start_time)} - {formatTime(activity.end_time)}</span>
                                    {activity.is_recurring && (
                                        <span>Hari: {getRecurringDays(activity.recurring_days)}</span>
                                    )}
                                </div>
                            </div>
                            {isAdmin && (
                                <div className="flex space-x-2">
                                    {onGenerateQr && <Button size="sm" variant="outline" onClick={() => onGenerateQr(activity.id)}>QR Code</Button>}
                                    {onEdit && <Button size="sm" variant="secondary" onClick={() => onEdit(activity)}>Edit</Button>}
                                    {onDelete && <Button size="sm" variant="danger" onClick={() => onDelete(activity.id)}>Hapus</Button>}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

