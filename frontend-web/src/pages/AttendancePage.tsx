import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../stores/useAppStore';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { AttendanceList } from '../components/attendance/AttendanceList';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const AttendancePage = () => {
    const {
        attendances,
        isLoading,
        error,
        loadAttendanceHistory
    } = useAppStore();

    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadAttendanceHistory(dateRange.start, dateRange.end);
    }, [loadAttendanceHistory, dateRange.start, dateRange.end]);

    const handleDateChange = (field: 'start' | 'end', value: string) => {
        setDateRange(prev => ({ ...prev, [field]: value }));
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
                <p className="text-gray-600">View your attendance records</p>
            </div>

            {/* Date Filter */}
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-900">Filter by Date</h2>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => handleDateChange('start', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => handleDateChange('end', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div className="self-end">
                            <Button
                                onClick={() => loadAttendanceHistory(dateRange.start, dateRange.end)}
                                className="whitespace-nowrap"
                            >
                                Apply Filter
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-100 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Attendance List */}
            <AttendanceList
                attendances={attendances}
                title={`Attendance Records (${attendances.length})`}
            />

            {/* Empty State */}
            {attendances.length === 0 && !isLoading && (
                <Card>
                    <CardContent>
                        <div className="text-center py-12">
                            <p className="text-gray-500">No attendance records found for the selected date range.</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};