<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceType;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AttendanceController extends Controller
{

    protected $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {

        $this->attendanceService = $attendanceService;
    }

    public function checkIn(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'qr_content'         => 'required|string',
            'attendance_type_id' => 'required|exists:attendance_types,id',
            'latitude'           => 'sometimes|numeric',
            'longitude'          => 'sometimes|numeric',
            'notes'              => 'sometimes|string|max:500',
        ]);

        if ($validator->fails())
        {
            return response()->json($validator->errors(), 422);
        }

        try
        {
            // Validasi QR code
            $user = $this->attendanceService->validateQRCode($request->qr_content);

            if (!$user)
            {
                return response()->json([ 'error' => 'QR code tidak valid atau sudah kadaluarsa' ], 400);
            }

            // Check-in
            $attendance = $this->attendanceService->checkIn(
                $user,
                $request->attendance_type_id,
                $request->latitude,
                $request->longitude,
                $request->notes,
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

    public function checkOut(Request $request, $attendanceId)
    {

        $validator = Validator::make($request->all(), [
            'latitude'  => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'notes'     => 'sometimes|string|max:500',
        ]);

        if ($validator->fails())
        {
            return response()->json($validator->errors(), 422);
        }

        try
        {
            $attendance = Attendance::findOrFail($attendanceId);

            // Pastikan user hanya bisa check-out attendance miliknya sendiri
            if ($attendance->user_id !== $request->user()->id)
            {
                return response()->json([ 'error' => 'Unauthorized' ], 403);
            }

            $attendance = $this->attendanceService->checkOut(
                $attendance,
                $request->latitude,
                $request->longitude,
                $request->notes,
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

    public function getAttendanceHistory(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'start_date' => 'sometimes|date',
            'end_date'   => 'sometimes|date|after_or_equal:start_date',
        ]);

        if ($validator->fails())
        {
            return response()->json($validator->errors(), 422);
        }

        $history = $this->attendanceService->getUserAttendanceHistory(
            $request->user()->id,
            $request->start_date,
            $request->end_date,
        );

        return response()->json([ 'history' => $history ]);
    }

    public function getAttendanceTypes()
    {

        $types = AttendanceType::all();
        return response()->json([ 'attendance_types' => $types ]);
    }

}
