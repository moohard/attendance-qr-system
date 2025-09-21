<?php

use App\Http\Controllers\API\ActivityController;
use App\Http\Controllers\Auth\TwoFactorAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\AttendanceController;

// ✅ Route authentication TANPA middleware auth (public access)
Route::prefix('auth')->group(function ()
{
    Route::post('/login', [ AuthController::class, 'login' ])->name('login'); // ✅ Beri nama 'login'
    Route::post('/register', [ AuthController::class, 'register' ])->name('register');
    Route::post('/logout', [ AuthController::class, 'logout' ])->name('logout');
    Route::post('/refresh', [ AuthController::class, 'refresh' ])->name('refresh');
    Route::get('/user-profile', [ AuthController::class, 'userProfile' ])->name('user-profile');
});

// ✅ Route yang membutuhkan authentication
Route::middleware([ 'auth:sanctum', 'throttle:60,1' ])->group(function ()
{
    Route::prefix('attendance')->group(function ()
    {
        Route::post('/check-in', [ AttendanceController::class, 'checkIn' ]);
        Route::post('/check-out/{attendance}', [ AttendanceController::class, 'checkOut' ]);
        Route::get('/active', [ AttendanceController::class, 'getActiveAttendances' ]);
        Route::get('/history', [ AttendanceController::class, 'getAttendanceHistory' ]);
        Route::get('/types', [ AttendanceController::class, 'getAttendanceTypes' ]);
    });

    // 2FA Routes
    Route::prefix('2fa')->group(function ()
    {
        Route::post('/enable', [ TwoFactorAuthController::class, 'enable' ]);
        Route::post('/disable', [ TwoFactorAuthController::class, 'disable' ]);
        Route::post('/verify', [ TwoFactorAuthController::class, 'verify' ]);
        Route::get('/status', [ TwoFactorAuthController::class, 'status' ]);
    });

    Route::prefix('activities')->group(function ()
    {
        Route::get('/', [ ActivityController::class, 'index' ]);
        Route::post('/checkin', [ ActivityController::class, 'checkIn' ]);
        Route::post('/checkout/{attendance}', [ ActivityController::class, 'checkOut' ]);
        Route::get('/my-attendances', [ ActivityController::class, 'getMyAttendances' ]);
        Route::get('/{activity}/qr', [ ActivityController::class, 'generateQrCode' ]);
    });
});

Route::prefix('admin')->group(function ()
{
    require __DIR__ . '/admin.php';
});

Route::middleware('auth:sanctum')->get('/test', function (Request $request)
{
    return response()->json([ 'message' => 'API is working!', 'user' => $request->user() ]);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request)
{
    return $request->user();
});
