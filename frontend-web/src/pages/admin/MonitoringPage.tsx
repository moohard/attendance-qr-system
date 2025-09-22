import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { RefreshCw, AlertTriangle, CheckCircle, Server } from 'lucide-react';

interface SystemStats {
    users: {
        total: number;
        active_today: number;
        admins: number;
        honorer: number;
    };
    attendance: {
        today_checkins: number;
        today_checkouts: number;
        late_checkins: number;
        active_sessions: number;
    };
    system: {
        memory_usage: number;
        database_connections: number;
        uptime: number;
        cache_hit_rate: number;
    };
    performance: {
        average_response_time: number;
        error_rate: number;
        throughput: number;
    };
}

export const MonitoringPage: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/monitoring/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load monitoring data');
            }

            const data = await response.json();
            setStats(data.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const flushCache = async () => {
        if (!confirm('Are you sure you want to flush the cache?')) {
            return;
        }

        try {
            const response = await fetch('/api/monitoring/flush-cache', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                },
            });

            if (response.ok) {
                alert('Cache flushed successfully');
                loadStats();
            }
        } catch (err) {
            console.error('Failed to flush cache:', err);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            loadStats();
            // Refresh stats every 30 seconds
            const interval = setInterval(loadStats, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    if (user?.role !== 'admin') {
        return (
            <div className="p-6">
                <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">Access denied. Admin privileges required.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-700">{error}</p>
                </div>
                <Button onClick={loadStats}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
                    <p className="text-gray-600">Real-time system statistics and performance metrics</p>
                </div>
                <div className="flex space-x-2">
                    <Button onClick={loadStats} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={flushCache} variant="outline">
                        <Server className="w-4 h-4 mr-2" />
                        Flush Cache
                    </Button>
                </div>
            </div>

            {/* System Health Status */}
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center p-4 bg-green-50 rounded-lg">
                            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-green-800">Database</p>
                                <p className="text-2xl font-bold text-green-900">{stats.system.database_connections}</p>
                                <p className="text-xs text-green-600">connections</p>
                            </div>
                        </div>

                        <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                            <Server className="w-8 h-8 text-blue-600 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-blue-800">Memory</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.system.memory_usage.toFixed(1)}</p>
                                <p className="text-xs text-blue-600">MB used</p>
                            </div>
                        </div>

                        <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                            <RefreshCw className="w-8 h-8 text-purple-600 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-purple-800">Uptime</p>
                                <p className="text-lg font-bold text-purple-900">{formatUptime(stats.system.uptime)}</p>
                            </div>
                        </div>

                        <div className="flex items-center p-4 bg-orange-50 rounded-lg">
                            <AlertTriangle className="w-8 h-8 text-orange-600 mr-3" />
                            <div>
                                <p className="text-sm font-medium text-orange-800">Error Rate</p>
                                <p className="text-2xl font-bold text-orange-900">{stats.performance.error_rate.toFixed(1)}%</p>
                                <p className="text-xs text-orange-600">last 5min</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* User Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-gray-900">User Statistics</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Users</span>
                                <span className="font-semibold">{stats.users.total}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Active Today</span>
                                <span className="font-semibold">{stats.users.active_today}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Admin Users</span>
                                <span className="font-semibold">{stats.users.admins}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Honorer Users</span>
                                <span className="font-semibold">{stats.users.honorer}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Attendance Statistics */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-gray-900">Attendance Today</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Check-ins</span>
                                <span className="font-semibold">{stats.attendance.today_checkins}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Check-outs</span>
                                <span className="font-semibold">{stats.attendance.today_checkouts}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Late Arrivals</span>
                                <span className="font-semibold text-orange-600">{stats.attendance.late_checkins}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Active Sessions</span>
                                <span className="font-semibold text-green-600">{stats.attendance.active_sessions}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Metrics */}
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-900">Performance Metrics</h2>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Avg Response Time</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.performance.average_response_time.toFixed(2)}s
                            </p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Cache Hit Rate</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.system.cache_hit_rate.toFixed(1)}%
                            </p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Throughput</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.performance.throughput.toFixed(1)}/s
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};