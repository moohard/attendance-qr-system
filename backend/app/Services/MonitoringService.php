<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Attendance;

class MonitoringService
{

    public function getSystemStats(): array
    {

        return Cache::remember('system_stats', 60, function ()
        { // Cache for 1 minute
            return [
                'users'       => [
                    'total'        => User::count(),
                    'active_today' => User::whereHas('attendances', function ($query)
                    {
                        $query->whereDate('check_in', today());
                    })->count(),
                    'admins'       => User::where('role', 'admin')->count(),
                    'honorer'      => User::where('is_honorer', TRUE)->count(),
                ],
                'attendance'  => [
                    'today_checkins'  => Attendance::whereDate('check_in', today())->count(),
                    'today_checkouts' => Attendance::whereDate('check_out', today())->count(),
                    'late_checkins'   => Attendance::whereDate('check_in', today())
                        ->where('is_late', TRUE)->count(),
                    'active_sessions' => Attendance::whereDate('check_in', today())
                        ->whereNull('check_out')->count(),
                ],
                'system'      => [
                    'memory_usage'         => memory_get_usage(TRUE) / 1024 / 1024, // MB
                    'database_connections' => DB::select('SELECT COUNT(*) as count FROM information_schema.PROCESSLIST')[0]->count,
                    'uptime'               => $this->getSystemUptime(),
                    'cache_hit_rate'       => $this->getCacheHitRate(),
                ],
                'performance' => [
                    'average_response_time' => $this->getAverageResponseTime(),
                    'error_rate'            => $this->getErrorRate(),
                    'throughput'            => $this->getThroughput(),
                ],
            ];
        });
    }

    public function getAttendanceTrends($days = 7): array
    {

        $trends = [];

        for ($i = $days - 1; $i >= 0; $i--)
        {
            $date = now()->subDays($i)->format('Y-m-d');

            $trends[$date] = [
                'checkins'  => Attendance::whereDate('check_in', $date)->count(),
                'checkouts' => Attendance::whereDate('check_out', $date)->count(),
                'late'      => Attendance::whereDate('check_in', $date)
                    ->where('is_late', TRUE)->count(),
                'early'     => Attendance::whereDate('check_out', $date)
                    ->where('is_early', TRUE)->count(),
            ];
        }

        return $trends;
    }

    public function getUserActivityReport($userId = NULL): array
    {

        $query = Attendance::query();

        if ($userId)
        {
            $query->where('user_id', $userId);
        }

        $report = $query->selectRaw('
            COUNT(*) as total_attendances,
            AVG(TIMESTAMPDIFF(SECOND, check_in, check_out)) as avg_duration_seconds,
            SUM(is_late) as late_count,
            SUM(is_early) as early_count,
            DATE(check_in) as date
        ')
            ->whereNotNull('check_out')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(30)
            ->get();

        return $report->toArray();
    }

    public function logPerformanceMetric(string $metric, float $value, array $tags = []): void
    {

        Log::channel('performance')->info('Performance metric', [
            'metric'    => $metric,
            'value'     => $value,
            'tags'      => $tags,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function logSecurityEvent(string $event, array $details = []): void
    {

        Log::channel('security')->warning('Security event', [
            'event'      => $event,
            'details'    => $details,
            'ip'         => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp'  => now()->toISOString(),
        ]);
    }

    protected function getSystemUptime(): int
    {

        // Simulate uptime calculation
        return time() - Cache::get('system_start_time', time());
    }

    protected function getCacheHitRate(): float
    {

        $hits   = Cache::get('cache_hits', 0);
        $misses = Cache::get('cache_misses', 0);
        $total  = $hits + $misses;

        return $total > 0 ? ($hits / $total) * 100 : 0;
    }

    protected function getAverageResponseTime(): float
    {

        $times = Cache::get('response_times', []);
        return count($times) > 0 ? array_sum($times) / count($times) : 0;
    }

    protected function getErrorRate(): float
    {

        $errors   = Cache::get('error_count', 0);
        $requests = Cache::get('request_count', 1); // Avoid division by zero

        return ($errors / $requests) * 100;
    }

    protected function getThroughput(): float
    {

        $requests   = Cache::get('request_count', 0);
        $timeWindow = 300; // 5 minutes in seconds

        return $requests / $timeWindow;
    }

}
