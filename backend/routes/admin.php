<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\StatsController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\AttendanceController;

Route::middleware([ 'auth:sanctum', 'role:admin', 'throttle:30,1' ])->group(function ()
{
    // User Management
    Route::apiResource('users', UserController::class);
    Route::get('users', [ UserController::class, 'index' ]);

    // Statistics
    Route::get('stats/users', [ StatsController::class, 'userStats' ]);
    Route::get('stats/attendance', [ StatsController::class, 'attendanceStats' ]);
    Route::get('stats/attendance/trends', [ StatsController::class, 'attendanceTrends' ]);

    // Reports
    Route::get('reports', [ ReportController::class, 'index' ]);
    Route::post('reports/generate', [ ReportController::class, 'generate' ]);
    Route::get('reports/{id}/download', [ ReportController::class, 'download' ]);
    Route::post('reports/{id}/sign', [ ReportController::class, 'sign' ]);

    // Attendance Management
    Route::get('attendances', [ AttendanceController::class, 'index' ]);
    Route::get('attendances/{attendance}', [ AttendanceController::class, 'show' ]);
    Route::put('attendances/{attendance}', [ AttendanceController::class, 'update' ]);
    Route::delete('attendances/{attendance}', [ AttendanceController::class, 'destroy' ]);
    Route::get('attendances/export', [ AttendanceController::class, 'export' ]);
});
