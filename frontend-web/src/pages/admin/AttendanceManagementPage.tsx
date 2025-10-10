import { useEffect, useState } from 'react';
import { Download, Filter, Calendar } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { DataTable } from '../../components/admin/DataTable';
import { Button } from '../../components/ui/Button';
import type { LoadingSpinner } from '../ui/LoadingSpinner';
import { formatDate, formatTime } from '../../utils/date';
import type { Attendance as DailyAttendance, Activity, AttendanceFilters } from '../../types';

// A more inclusive type for the unified attendance data
type CombinedAttendance = DailyAttendance & {
    record_type?: 'daily' | 'activity';
    activity?: Activity;
};

export const AttendanceManagementPage = () => {
    const { getAttendances, exportAttendances, isLoading } = useAdmin();
    const [attendances, setAttendances] = useState<CombinedAttendance[]>([]);
    const [pagination, setPagination] = useState({ page: 1, perPage: 10, total: 0 });
    const [filters, setFilters] = useState<AttendanceFilters>({});
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadAttendances();
    }, [pagination.page, filters]);

    const loadAttendances = async () => {
        try {
            const response = await getAttendances(pagination.page, pagination.perPage, filters);
            setAttendances(response.data);
            setPagination(prev => ({
                ...prev,
                total: response.total,
                page: response.current_page,
            }));
        } catch (error) {
            console.error('Failed to load attendances:', error);
        }
    };

    const handleExport = async (format: 'csv' | 'excel' = 'csv') => {
        try {
            const blob = await exportAttendances(filters, format);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `attendances-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export attendances:', error);
        }
    };

    const columns = [
        { header: 'User', accessor: (att: CombinedAttendance) => att.user?.name || 'Unknown' },
        {
            header: 'Type',
            accessor: (att: CombinedAttendance) =>
                att.record_type === 'activity'
                    ? att.activity?.name
                    : att.attendance_type?.name,
        },
        {
            header: 'Check-in',
            accessor: (att: CombinedAttendance) => formatTime(att.check_in)
        },
        {
            header: 'Check-out',
            accessor: (att: CombinedAttendance) => att.check_out ? formatTime(att.check_out) : '-'
        },
        {
            header: 'Date',
            accessor: (att: CombinedAttendance) => formatDate(att.check_in)
        },
        {
            header: 'Status',
            accessor: (att: CombinedAttendance) => (
                <div className="flex flex-wrap gap-1">
                    {att.is_late && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Late
                        </span>
                    )}
                    {att.is_early && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Early
                        </span>
                    )}
                    {!att.check_out && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Active
                        </span>
                    )}
                </div>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
                    <p className="text-gray-600">View and manage all attendance records</p>
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleExport('csv')}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleExport('excel')}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export Excel
                    </Button>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                value={filters.date || ''}
                                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={filters.start_date || ''}
                                onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={filters.end_date || ''}
                                onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div className="flex space-x-3 mt-4">
                        <Button onClick={loadAttendances} loading={isLoading}>
                            Apply Filters
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setFilters({});
                                setShowFilters(false);
                            }}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            )}

            {/* Attendances Table */}
            <DataTable
                columns={columns}
                data={attendances}
                loading={isLoading}
                title={`Attendance Records (${pagination.total})`}
            />

            {/* Pagination */}
            {pagination.total > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                        Showing {pagination.page} to {pagination.perPage} of {pagination.total} results
                    </p>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.page * pagination.perPage >= pagination.total}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};