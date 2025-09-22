<?php

use App\Http\Controllers\API\ActivityController;
use App\Http\Controllers\API\MonitoringController;
use App\Http\Controllers\Api\SignatureController;
use App\Http\Controllers\Auth\TwoFactorAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Api\AttendanceController;

Route::middleware('validate.api')->group(function ()
{
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
    Route::middleware('auth:sanctum')->group(function ()
    {
        Route::prefix('signatures')->group(function ()
        {
            Route::post('/save', [ SignatureController::class, 'saveSignature' ]);
            Route::get('/{signatureId}', [ SignatureController::class, 'getSignature' ]);
            Route::post('/{signatureId}/verify', [ SignatureController::class, 'verifySignature' ]);
            Route::delete('/{signatureId}', [ SignatureController::class, 'deleteSignature' ]);
            Route::post('/test', [ SignatureController::class, 'testSignature' ]);
        });
    });
    // Monitoring Routes (Admin only)
    Route::middleware([ 'auth:sanctum', 'role:admin', 'throttle:10,1' ])->group(function ()
    {
        Route::prefix('monitoring')->group(function ()
        {
            Route::get('/stats', [ MonitoringController::class, 'stats' ]);
            Route::get('/trends', [ MonitoringController::class, 'trends' ]);
            Route::get('/user-activity/{userId?}', [ MonitoringController::class, 'userActivity' ]);
            Route::post('/flush-cache', [ MonitoringController::class, 'flushCache' ]);
        });
    });

    // Public health check route
    Route::get('/health', [ MonitoringController::class, 'healthCheck' ]);
});
