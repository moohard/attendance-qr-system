<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MonitoringService;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MonitoringController extends Controller
{
    protected $monitoringService;

    public function __construct(MonitoringService $monitoringService)
    {
        $this->monitoringService = $monitoringService;

    }

    public function stats(Request $request)
    {
        // Only allow admin users to access monitoring
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $stats = $this->monitoringService->getSystemStats();

        return response()->json([
            'success' => true,
            'data' => $stats,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function trends(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $days = $request->get('days', 7);
        $trends = $this->monitoringService->getAttendanceTrends($days);

        return response()->json([
            'success' => true,
            'data' => $trends,
            'period' => $days . ' days',
        ]);
    }

    public function userActivity(Request $request, $userId = null)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $report = $this->monitoringService->getUserActivityReport($userId);

        return response()->json([
            'success' => true,
            'data' => $report,
            'user_id' => $userId,
        ]);
    }

    public function healthCheck()
    {
        // Basic health check endpoint
        $checks = [
            'database' => $this->checkDatabaseConnection(),
            'cache' => $this->checkCacheConnection(),
            'storage' => $this->checkStorageWritable(),
            'queue' => $this->checkQueueStatus(),
        ];

        $allHealthy = !in_array(false, $checks, true);

        return response()->json([
            'status' => $allHealthy ? 'healthy' : 'unhealthy',
            'timestamp' => now()->toISOString(),
            'checks' => $checks,
        ], $allHealthy ? 200 : 503);
    }

    public function flushCache(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        Cache::flush();

        return response()->json([
            'success' => true,
            'message' => 'Cache flushed successfully',
        ]);
    }

    protected function checkDatabaseConnection(): bool
    {
        try {
            DB::connection()->getPdo();
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    protected function checkCacheConnection(): bool
    {
        try {
            Cache::put('health_check', 'ok', 10);
            return Cache::get('health_check') === 'ok';
        } catch (\Exception $e) {
            return false;
        }
    }

    protected function checkStorageWritable(): bool
    {
        try {
            $path = storage_path('app/health_check.txt');
            file_put_contents($path, 'test');
            unlink($path);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    protected function checkQueueStatus(): bool
    {
        // Simple queue status check
        return true; // In production, you might check queue worker status
    }
}
