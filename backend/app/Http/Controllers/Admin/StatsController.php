<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{

    public function userStats()
    {

        $totalUsers   = User::count();
        $activeUsers  = User::whereHas('attendances', function ($query)
        {
            $query->whereDate('check_in', today());
        })->count();
        $honorerUsers = User::where('is_honorer', TRUE)->count();
        $adminUsers   = User::where('role', 'admin')->count();

        return response()->json([
            'total_users'   => $totalUsers,
            'active_users'  => $activeUsers,
            'honorer_users' => $honorerUsers,
            'admin_users'   => $adminUsers,
        ]);
    }

    public function attendanceStats()
    {

        $totalCheckins  = Attendance::count();
        $todayCheckins  = Attendance::whereDate('check_in', today())->count();
        $lateCheckins   = Attendance::where('is_late', TRUE)->count();
        $earlyCheckouts = Attendance::where('is_early', TRUE)->count();

        return response()->json([
            'total_checkins'  => $totalCheckins,
            'today_checkins'  => $todayCheckins,
            'late_checkins'   => $lateCheckins,
            'early_checkouts' => $earlyCheckouts,
        ]);
    }

    public function attendanceTrends(Request $request)
    {

        $days = $request->days ?? 7;

        $trends = Attendance::select(
            DB::raw('DATE(check_in) as date'),
            DB::raw('COUNT(*) as count'),
        )
            ->whereDate('check_in', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($trends);
    }

}
