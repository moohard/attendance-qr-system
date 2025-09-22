<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\StatsController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\AttendanceController as AdminAttendanceController;
use App\Http\Controllers\Api\MonitoringController; // Tambahkan ini
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Rute-rute ini khusus untuk admin dan secara otomatis akan memiliki
| prefix /api/admin dan middleware role:admin dari file api.php.
|
*/

// User Management
Route::apiResource('users', UserController::class);

// Statistics
Route::prefix('stats')->name('stats.')->group(function ()
{
    Route::get('/users', [ StatsController::class, 'userStats' ]);
    Route::get('/attendance', [ StatsController::class, 'attendanceStats' ]);
    Route::get('/attendance/trends', [ StatsController::class, 'attendanceTrends' ]);
});

// Reports
Route::prefix('reports')->name('reports.')->group(function ()
{
    Route::get('/', [ ReportController::class, 'index' ]);
    Route::post('/generate', [ ReportController::class, 'generate' ]);
    Route::get('/{report}/download', [ ReportController::class, 'download' ]);
    Route::post('/{report}/sign', [ ReportController::class, 'sign' ]);
});

// Attendance Management
Route::prefix('attendances')->name('attendances.')->group(function ()
{
    Route::get('/', [ AdminAttendanceController::class, 'index' ]);
    Route::get('/{attendance}', [ AdminAttendanceController::class, 'show' ]);
    Route::put('/{attendance}', [ AdminAttendanceController::class, 'update' ]);
    Route::delete('/{attendance}', [ AdminAttendanceController::class, 'destroy' ]);
    Route::get('/export', [ AdminAttendanceController::class, 'export' ]);
});

// Monitoring Routes (DIKEMBALIKAN DI SINI)
Route::prefix('monitoring')->name('monitoring.')->group(function ()
{
    Route::get('/stats', [ MonitoringController::class, 'stats' ]);
    Route::get('/trends', [ MonitoringController::class, 'trends' ]);
    Route::get('/user-activity/{user?}', [ MonitoringController::class, 'userActivity' ]);
    Route::post('/flush-cache', [ MonitoringController::class, 'flushCache' ]);
});
