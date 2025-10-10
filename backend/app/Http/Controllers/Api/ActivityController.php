<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityAttendance;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ActivityController extends Controller
{

    protected $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {

        $this->attendanceService = $attendanceService;
    }

    public function index(Request $request)
    {

        $currentOnly = $request->boolean('current', TRUE);

        $activities = $currentOnly ? Activity::getActiveActivities() : Activity::with('creator')
            ->orderBy('name')
            ->get();

        return response()->json([ 'activities' => $activities ]);
    }

    public function checkIn(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'qr_content' => 'required|string',
            'latitude'   => 'sometimes|numeric',
            'longitude'  => 'sometimes|numeric',
            'notes'      => 'sometimes|string|max:500',
        ]);

        if ($validator->fails())
        {
            return response()->json($validator->errors(), 422);
        }

        try
        {
            // Validasi QR code
            $activity = $this->attendanceService->validateActivityQRCode($request->qr_content);

            if (!$activity)
            {
                return response()->json([ 'error' => 'QR code kegiatan tidak valid atau sudah kadaluarsa' ], 400);
            }

            // Check-in
            $attendance = $this->attendanceService->checkInToActivity(
                Auth::user(),
                $activity->id,
                $request->latitude,
                $request->longitude,
                $request->notes,
            );

            return response()->json([
                'message'    => 'Check-in berhasil',
                'attendance' => $attendance->load('activity'),
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
            $attendance = ActivityAttendance::findOrFail($attendanceId);

            // Pastikan user hanya bisa check-out attendance miliknya sendiri
            if ($attendance->user_id !== Auth::id())
            {
                return response()->json([ 'error' => 'Unauthorized' ], 403);
            }

            $attendance = $this->attendanceService->checkOutFromActivity(
                $attendance,
                $request->latitude,
                $request->longitude,
                $request->notes,
            );

            return response()->json([
                'message'    => 'Check-out berhasil',
                'attendance' => $attendance->load('activity'),
            ]);

        } catch (\Exception $e)
        {
            return response()->json([ 'error' => $e->getMessage() ], 400);
        }
    }

    public function getMyAttendances(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'start_date'  => 'sometimes|date',
            'end_date'    => 'sometimes|date|after_or_equal:start_date',
            'activity_id' => 'sometimes|exists:activities,id',
        ]);

        if ($validator->fails())
        {
            return response()->json($validator->errors(), 422);
        }

        $query = ActivityAttendance::with('activity')
            ->where('user_id', Auth::id())
            ->orderBy('check_in', 'desc');

        if ($request->has('start_date'))
        {
            $query->whereDate('check_in', '>=', $request->start_date);
        }

        if ($request->has('end_date'))
        {
            $query->whereDate('check_in', '<=', $request->end_date);
        }

        if ($request->has('activity_id'))
        {
            $query->where('activity_id', $request->activity_id);
        }

        $attendances = $query->get();

        return response()->json([ 'attendances' => $attendances ]);
    }

    public function generateQrCode($activityId)
    {

        $activity = Activity::findOrFail($activityId);

        // Hanya creator yang bisa generate QR code
        if ($activity->created_by !== Auth::id())
        {
            return response()->json([ 'error' => 'Unauthorized' ], 403);
        }

        $qrCode = $activity->generateQrCode();

        return response()->json([
            'qr_code'    => $qrCode,
            'activity'   => $activity,
            'expires_at' => now()->addMinutes(30)->toISOString(),
        ]);
    }

}
