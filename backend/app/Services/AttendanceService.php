<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\ActivityAttendance;
use App\Models\Attendance;
use App\Models\AttendanceType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AttendanceService
{

    public function checkIn(User $user, $attendanceTypeId, $latitude = NULL, $longitude = NULL, $notes = NULL)
    {

        $attendanceType = AttendanceType::findOrFail($attendanceTypeId);
        $now            = Carbon::now();
        $today          = $now->format('Y-m-d');

        // Cek apakah user sudah check-in hari ini untuk type ini
        $existingAttendance = Attendance::where('user_id', $user->id)
            ->where('attendance_type_id', $attendanceTypeId)
            ->whereDate('check_in', $today)
            ->first();

        if ($existingAttendance)
        {
            throw new \Exception('Anda sudah melakukan check-in hari ini untuk shift ini.');
        }

        // Tentukan apakah terlambat
        $startTime = Carbon::createFromTimeString($attendanceType->start_time);
        $isLate    = $now->gt($startTime);

        // Buat attendance record
        $attendance = Attendance::create([
            'user_id'            => $user->id,
            'attendance_type_id' => $attendanceTypeId,
            'check_in'           => $now,
            'latitude'           => $latitude,
            'longitude'          => $longitude,
            'notes'              => $notes,
            'is_late'            => $isLate,
        ]);

        return $attendance;
    }

    public function checkOut(Attendance $attendance, $latitude = NULL, $longitude = NULL, $notes = NULL)
    {

        if ($attendance->check_out)
        {
            throw new \Exception('Anda sudah melakukan check-out untuk absensi ini.');
        }

        $now            = Carbon::now();
        $attendanceType = $attendance->attendanceType;

        // Tentukan apakah pulang lebih awal
        $endTime = Carbon::createFromTimeString($attendanceType->end_time);
        $isEarly = $now->lt($endTime);

        // Update attendance record
        $attendance->update([
            'check_out' => $now,
            'latitude'  => $latitude ?? $attendance->latitude,
            'longitude' => $longitude ?? $attendance->longitude,
            'notes'     => $notes ?? $attendance->notes,
            'is_early'  => $isEarly,
        ]);

        return $attendance;
    }

    public function getUserAttendanceHistory($userId, $startDate = NULL, $endDate = NULL)
    {

        $query = Attendance::with('attendanceType')
            ->where('user_id', $userId)
            ->orderBy('check_in', 'desc');

        if ($startDate && $endDate)
        {
            $query->whereBetween('check_in', [ $startDate, $endDate ]);
        }

        return $query->get();
    }

    public function validateQRCode($qrContent)
    {

        try
        {
            $data = json_decode($qrContent, TRUE);

            // Validasi struktur QR code
            if (!isset($data['user_id']) || !isset($data['timestamp']))
            {
                return NULL;
            }

            // Cek apakah QR code masih valid (dibuat dalam 5 menit terakhir)
            $qrTime = Carbon::createFromTimestamp($data['timestamp']);
            if ($qrTime->diffInMinutes(Carbon::now()) > 5)
            {
                return NULL;
            }

            // Cek apakah user exists
            $user = User::find($data['user_id']);
            if (!$user)
            {
                return NULL;
            }

            return $user;

        } catch (\Exception $e)
        {
            Log::error('QR validation error: ' . $e->getMessage());
            return NULL;
        }
    }

    public function checkInToActivity(User $user, $activityId, $latitude = NULL, $longitude = NULL, $notes = NULL)
    {

        $activity = Activity::findOrFail($activityId);

        // Check if activity is active
        if (!$activity->isActive())
        {
            throw new \Exception('Kegiatan tidak aktif atau sudah berakhir.');
        }

        // Check if user already checked in today
        $today              = now()->format('Y-m-d');
        $existingAttendance = ActivityAttendance::where('activity_id', $activityId)
            ->where('user_id', $user->id)
            ->whereDate('check_in', $today)
            ->first();

        if ($existingAttendance)
        {
            throw new \Exception('Anda sudah melakukan check-in untuk kegiatan ini hari ini.');
        }

        // Determine if late
        $scheduledTime = now()->setTimeFrom($activity->start_time);
        $isLate        = now()->gt($scheduledTime);

        // Create attendance record
        $attendance = ActivityAttendance::create([
            'activity_id' => $activityId,
            'user_id'     => $user->id,
            'check_in'    => now(),
            'latitude'    => $latitude,
            'longitude'   => $longitude,
            'notes'       => $notes,
            'is_late'     => $isLate,
        ]);

        return $attendance;
    }

    public function checkOutFromActivity(ActivityAttendance $attendance, $latitude = NULL, $longitude = NULL, $notes = NULL)
    {

        if ($attendance->check_out)
        {
            throw new \Exception('Anda sudah melakukan check-out untuk kehadiran ini.');
        }

        $activity = $attendance->activity;
        $now      = now();

        // Determine if early checkout
        $scheduledEndTime = now()->setTimeFrom($activity->end_time);
        $isEarly          = $now->lt($scheduledEndTime);

        $attendance->update([
            'check_out' => $now,
            'latitude'  => $latitude ?? $attendance->latitude,
            'longitude' => $longitude ?? $attendance->longitude,
            'notes'     => $notes ?? $attendance->notes,
            'is_early'  => $isEarly,
        ]);

        return $attendance;
    }

    public function validateActivityQRCode($qrContent)
    {

        try
        {
            $data = json_decode($qrContent, TRUE);

            // Basic validation
            if (!isset($data['type'], $data['activity_id'], $data['timestamp'], $data['expires_at']) || $data['type'] !== 'activity')
            {
                return NULL;
            }

            // Check expiry
            $expiryTime = Carbon::parse($data['expires_at']);
            if (now()->gt($expiryTime))
            {
                return NULL; // QR expired
            }

            // Get activity
            $activity = Activity::find($data['activity_id']);
            if (!$activity || !$activity->isActive())
            {
                return NULL;
            }

            return $activity;

        } catch (\Exception $e)
        {
            Log::error('Activity QR validation error: ' . $e->getMessage());
            return NULL;
        }
    }

}
