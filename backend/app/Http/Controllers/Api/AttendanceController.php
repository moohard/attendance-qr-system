<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\CheckInRequest;
use App\Http\Requests\Attendance\CheckOutRequest;
use App\Http\Requests\Attendance\AttendanceHistoryRequest;
use App\Models\Attendance;
use App\Models\AttendanceType;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class AttendanceController extends Controller
{

    protected $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {

        $this->attendanceService = $attendanceService;
    }

    /**
     * Menangani check-in pengguna.
     */
    public function checkIn(CheckInRequest $request)
    {

        try
        {
            $validatedData = $request->validated();
            $user          = $this->attendanceService->validateQRCode($validatedData['qr_content']);

            if (!$user)
            {
                return response()->json([ 'error' => 'QR code tidak valid atau sudah kadaluarsa' ], 400);
            }

            $attendance = $this->attendanceService->checkIn(
                $user,
                $validatedData['attendance_type_id'],
                $validatedData['latitude'] ?? NULL,
                $validatedData['longitude'] ?? NULL,
                $validatedData['notes'] ?? NULL
            );

            return response()->json([
                'message'    => 'Check-in berhasil',
                'attendance' => $attendance->load('attendanceType'),
            ], 201);
        } catch (\Exception $e)
        {
            return response()->json([ 'error' => $e->getMessage() ], 400);
        }
    }

    /**
     * Menangani check-out pengguna.
     */
    public function checkOut(CheckOutRequest $request, Attendance $attendance)
    {

        try
        {
            // Pastikan user hanya bisa check-out absensinya sendiri
            if ($attendance->user_id !== $request->user()->id)
            {
                return response()->json([ 'error' => 'Unauthorized' ], 403);
            }

            $validatedData = $request->validated();

            $attendance = $this->attendanceService->checkOut(
                $attendance,
                $validatedData['latitude'] ?? NULL,
                $validatedData['longitude'] ?? NULL,
                $validatedData['notes'] ?? NULL
            );

            return response()->json([
                'message'    => 'Check-out berhasil',
                'attendance' => $attendance->load('attendanceType'),
            ]);
        } catch (\Exception $e)
        {
            return response()->json([ 'error' => $e->getMessage() ], 400);
        }
    }

    /**
     * Mendapatkan absensi yang masih aktif hari ini.
     */
    public function getActiveAttendances(Request $request)
    {

        $today = now()->format('Y-m-d');

        $activeAttendances = Attendance::with('attendanceType')
            ->where('user_id', $request->user()->id)
            ->whereDate('check_in', $today)
            ->whereNull('check_out')
            ->get();

        return response()->json([ 'active_attendances' => $activeAttendances ]);
    }

    /**
     * Mendapatkan riwayat absensi pengguna.
     */
    public function getAttendanceHistory(AttendanceHistoryRequest $request)
    {

        $validatedData = $request->validated();

        $history = $this->attendanceService->getUserAttendanceHistory(
            $request->user()->id,
            $validatedData['start_date'] ?? NULL,
            $validatedData['end_date'] ?? NULL
        );

        return response()->json([ 'history' => $history ]);
    }

    /**
     * Mendapatkan semua jenis absensi yang tersedia (dari cache).
     */
    public function getAttendanceTypes()
    {

        $cacheKey = 'attendance_types.all';
        $duration = 60 * 60 * 24; // Cache selama 24 jam

        $attendanceTypes = Cache::remember($cacheKey, $duration, function ()
        {
            return AttendanceType::all();
        });

        return response()->json([
            'attendance_types' => $attendanceTypes,
        ]);
    }

}
