<?php

use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\MonitoringController;
use App\Http\Controllers\Api\QrCodeController;
use App\Http\Controllers\Api\SignatureController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\TwoFactorAuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// === RUTE PUBLIK ===
// Rute-rute yang tidak memerlukan autentikasi.
Route::post('/register', [ AuthController::class, 'register' ])->name('api.register');
Route::post('/login', [ AuthController::class, 'login' ])->name('api.login');
Route::get('/health', [ MonitoringController::class, 'healthCheck' ])->name('api.health');

// === RUTE TERAUTENTIKASI ===
// Semua rute di dalam grup ini memerlukan token Sanctum yang valid.
Route::middleware([ 'auth:sanctum', 'throttle:60,1' ])->group(function ()
{
    // Auth & User
    Route::post('/logout', [ AuthController::class, 'logout' ])->name('api.logout');
    Route::get('/user', [ AuthController::class, 'userProfile' ])->name('api.user');
    Route::post('/refresh', [ AuthController::class, 'refresh' ])->name('api.refresh'); // <-- DIKEMBALIKAN DI SINI

    // Two-Factor Authentication
    Route::prefix('2fa')->name('api.2fa.')->group(function ()
    {
        Route::post('/setup', [ TwoFactorAuthController::class, 'setup' ]);
        Route::post('/verify', [ TwoFactorAuthController::class, 'verify' ]);
        Route::post('/disable', [ TwoFactorAuthController::class, 'disable' ]);
        Route::get('/status', [ TwoFactorAuthController::class, 'status' ]);
    });

    // QR Code Generation
    Route::prefix('qr-code')->name('api.qrcode.')->group(function ()
    {
        Route::get('/daily', [ QrCodeController::class, 'generateDailyQr' ]);
        Route::get('/activity/{activity}', [ QrCodeController::class, 'generateActivityQr' ]);
    });

    // Attendance (Absensi Harian)
    Route::prefix('attendance')->name('api.attendance.')->group(function ()
    {
        Route::post('/check-in', [ AttendanceController::class, 'checkIn' ]);
        Route::post('/check-out/{attendance}', [ AttendanceController::class, 'checkOut' ]);
        Route::get('/active', [ AttendanceController::class, 'getActiveAttendances' ]);
        Route::get('/history', [ AttendanceController::class, 'getAttendanceHistory' ]);
        Route::get('/types', [ AttendanceController::class, 'getAttendanceTypes' ]);
    });

    // Activities (Absensi Kegiatan)
    Route::prefix('activities')->name('api.activities.')->group(function ()
    {
        Route::get('/', [ ActivityController::class, 'index' ]);
        Route::post('/check-in', [ ActivityController::class, 'checkIn' ]);
        Route::get('/history', [ ActivityController::class, 'getAttendanceHistory' ]);
    });

    // Signature
    Route::prefix('signatures')->name('api.signatures.')->group(function ()
    {
        Route::post('/upload', [ SignatureController::class, 'upload' ]);
    });

    // === RUTE KHUSUS ADMIN ===
    Route::middleware([ 'role:admin', 'throttle:30,1' ])->prefix('admin')->name('api.admin.')->group(function ()
    {
        // Memanggil rute admin dari file terpisah
        require __DIR__ . '/admin.php';
    });
});
