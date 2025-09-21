import { formatDate, formatTime } from '../../utils/date';
import { Card, CardContent, CardHeader } from '../ui/Card';
import type { Attendance } from '../../types';

interface AttendanceListProps {
    attendances: Attendance[];
    title: string;
    onCheckOut?: (attendance: Attendance) => void;
    showCheckOut?: boolean;
}

export const AttendanceList = ({
    attendances,
    title,
    onCheckOut,
    showCheckOut = false
}: AttendanceListProps) => {
    if (attendances.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {attendances.map((attendance) => (
                        <div
                            key={attendance.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                    {attendance.attendance_type?.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Check-in: {formatTime(attendance.check_in)}
                                    {attendance.check_out && ` • Check-out: ${formatTime(attendance.check_out)}`}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatDate(attendance.check_in)}
                                </p>
                                {attendance.is_late && (
                                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                        Late
                                    </span>
                                )}
                                {attendance.is_early && (
                                    <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                        Early
                                    </span>
                                )}
                            </div>

                            {showCheckOut && !attendance.check_out && onCheckOut && (
                                <button
                                    onClick={() => onCheckOut(attendance)}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Check Out
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};