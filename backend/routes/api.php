<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\AttendanceController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request)
{
    return $request->user();
});
Route::prefix('admin')->group(function ()
{
    require __DIR__ . '/admin.php';
});
Route::prefix('auth')->group(function ()
{
    Route::post('/login', [ AuthController::class, 'login' ]);
    Route::post('/register', [ AuthController::class, 'register' ]);

    Route::middleware('auth:sanctum')->group(function ()
    {
        Route::post('/logout', [ AuthController::class, 'logout' ]);
        Route::post('/refresh', [ AuthController::class, 'refresh' ]);
        Route::get('/user-profile', [ AuthController::class, 'userProfile' ]);
    });
});
Route::middleware('auth:sanctum')->group(function ()
{
    // Attendance routes
    Route::prefix('attendance')->group(function ()
    {
        Route::post('/check-in', [ AttendanceController::class, 'checkIn' ]);
        Route::post('/check-out/{attendance}', [ AttendanceController::class, 'checkOut' ]);
        Route::get('/active', [ AttendanceController::class, 'getActiveAttendances' ]);
        Route::get('/history', [ AttendanceController::class, 'getAttendanceHistory' ]);
        Route::get('/types', [ AttendanceController::class, 'getAttendanceTypes' ]);
    });
});

Route::middleware('auth:sanctum')->get('/test', function (Request $request)
{
    return response()->json([ 'message' => 'API is working!', 'user' => $request->user() ]);
});
