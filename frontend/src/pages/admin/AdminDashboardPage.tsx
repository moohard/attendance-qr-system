import { useEffect, useState } from 'react';
import {
    Users,
    Clock,
    Calendar,
    AlertCircle,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { useAuth } from '../../hooks/useAuth';
import { StatsCard } from '../../components/admin/StatsCard';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { UserStats, AttendanceStats } from '../../types';

export const AdminDashboardPage = () => {
    const { user } = useAuth();
    const { getUserStats, getAttendanceStats, isLoading, error } = useAdmin();
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [userStatsData, attendanceStatsData] = await Promise.all([
                getUserStats(),
                getAttendanceStats()
            ]);
            setUserStats(userStatsData);
            setAttendanceStats(attendanceStatsData);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
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
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-100 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Users"
                    value={userStats?.total_users || 0}
                    icon={<Users className="w-6 h-6 text-primary-600" />}
                    trend={{ value: 12, isPositive: true }}
                />

                <StatsCard
                    title="Active Users"
                    value={userStats?.active_users || 0}
                    icon={<Users className="w-6 h-6 text-green-600" />}
                    trend={{ value: 8, isPositive: true }}
                />

                <StatsCard
                    title="Today's Check-ins"
                    value={attendanceStats?.today_checkins || 0}
                    icon={<Clock className="w-6 h-6 text-blue-600" />}
                    trend={{ value: 5, isPositive: true }}
                />

                <StatsCard
                    title="Late Check-ins"
                    value={attendanceStats?.late_checkins || 0}
                    icon={<AlertCircle className="w-6 h-6 text-yellow-600" />}
                    trend={{ value: 3, isPositive: false }}
                />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">User Distribution</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Admin Users</span>
                                <span className="font-semibold">{userStats?.admin_users || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Honorer Users</span>
                                <span className="font-semibold">{userStats?.honorer_users || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Regular Users</span>
                                <span className="font-semibold">
                                    {(userStats?.total_users || 0) - (userStats?.admin_users || 0) - (userStats?.honorer_users || 0)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-gray-900">Attendance Overview</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Check-ins</span>
                                <span className="font-semibold">{attendanceStats?.total_checkins || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Early Check-outs</span>
                                <span className="font-semibold">{attendanceStats?.early_checkouts || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Attendance Rate</span>
                                <span className="font-semibold text-green-600">95%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="p-4 bg-primary-50 rounded-lg text-center hover:bg-primary-100 transition-colors">
                            <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                            <span className="text-sm font-medium text-primary-700">Manage Users</span>
                        </button>

                        <button className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
                            <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <span className="text-sm font-medium text-green-700">Generate Reports</span>
                        </button>

                        <button className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
                            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <span className="text-sm font-medium text-blue-700">View Attendance</span>
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};