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

    public function validateQRCode($qrContent)
    {

        try
        {
            \Log::info('QR Validation Started', [ 'qr_content' => substr($qrContent, 0, 100) ]);

            $data = json_decode($qrContent, TRUE);

            if (json_last_error() !== JSON_ERROR_NONE)
            {
                \Log::error('QR validation failed: Invalid JSON', [
                    'json_error' => json_last_error_msg(),
                    'qr_content' => substr($qrContent, 0, 200),
                ]);
                return NULL;
            }

            // Debug log data yang diterima
            \Log::debug('QR Data Received', $data);

            // Check required fields
            $requiredFields = [ 'type', 'user_id', 'timestamp', 'expires_at' ];
            foreach ($requiredFields as $field)
            {
                if (!isset($data[$field]))
                {
                    \Log::error('QR validation failed: Missing field', [
                        'missing_field'    => $field,
                        'available_fields' => array_keys($data),
                    ]);
                    return NULL;
                }
            }

            // Parse waktu dengan error handling
            try
            {
                $expiryTime = Carbon::parse($data['expires_at']);
                $qrTime     = Carbon::parse($data['timestamp']);
                $now        = Carbon::now();
            } catch (\Exception $e)
            {
                \Log::error('QR validation failed: Invalid timestamp format', [
                    'expires_at' => $data['expires_at'],
                    'timestamp'  => $data['timestamp'],
                    'error'      => $e->getMessage(),
                ]);
                return NULL;
            }

            // Check expiry dengan tolerance 10 detik untuk sinkronisasi waktu
            if ($now->diffInSeconds($expiryTime, FALSE) < -10)
            { // Expired lebih dari 10 detik
                \Log::warning('QR code expired', [
                    'now'          => $now->toISOString(),
                    'expires_at'   => $expiryTime->toISOString(),
                    'diff_seconds' => $now->diffInSeconds($expiryTime),
                    'tolerance'    => '10 seconds',
                ]);
                return NULL;
            }

            // Check jika QR code dari masa depan (lebih dari 10 detik)
            if ($qrTime->diffInSeconds($now, FALSE) < -10)
            {
                \Log::warning('QR code from future', [
                    'now'          => $now->toISOString(),
                    'qr_timestamp' => $qrTime->toISOString(),
                    'diff_seconds' => $qrTime->diffInSeconds($now),
                ]);
                return NULL;
            }

            // Get user
            $user = User::find($data['user_id']);
            if (!$user)
            {
                \Log::error('QR validation failed: User not found', [ 'user_id' => $data['user_id'] ]);
                return NULL;
            }

            \Log::info('QR Validation - User Found', [ 'user_id' => $user->id, 'user_email' => $user->email ]);

            // Type-based validation
            switch ($data['type'])
            {
                case 'user_checkin':
                    $result = $this->validateCheckInQR($data, $user);
                    break;
                case 'checkout':
                    $result = $this->validateCheckoutQR($data, $user);
                    break;
                case 'activity':
                    $result = $this->validateActivityQRCode($data);
                    break;
                default:
                    \Log::error('QR validation failed: Unknown type', [ 'type' => $data['type'] ]);
                    return NULL;
            }

            \Log::info('QR Validation Result', [
                'type'        => $data['type'],
                'success'     => $result !== NULL,
                'result_type' => gettype($result),
            ]);

            return $result;

        } catch (\Exception $e)
        {
            \Log::error('QR validation exception: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'trace'     => $e->getTraceAsString(),
            ]);
            return NULL;
        }
    }

    private function validateCheckInQR($data, $user)
    {

        \Log::info('Validating Check-in QR', [ 'user_id' => $user->id ]);

        // Check jika user sudah check-in hari ini untuk type yang sama
        $today              = now()->format('Y-m-d');
        $existingAttendance = Attendance::where('user_id', $user->id)
            ->where('attendance_type_id', $data['attendance_type_id'] ?? NULL)
            ->whereDate('check_in', $today)
            ->first();

        if ($existingAttendance)
        {
            \Log::warning('User already checked in today', [
                'user_id'                => $user->id,
                'existing_attendance_id' => $existingAttendance->id,
            ]);
            return NULL;
        }

        \Log::info('Check-in QR Validated Successfully');
        return $user;
    }

    private function validateActivityQRCode($data)
    {

        \Log::info('Validating Activity QR', [ 'activity_id' => $data['activity_id'] ?? 'unknown' ]);

        if (!isset($data['activity_id']))
        {
            \Log::error('Activity QR missing activity_id');
            return NULL;
        }

        $activity = Activity::find($data['activity_id']);
        if (!$activity)
        {
            \Log::error('Activity not found', [ 'activity_id' => $data['activity_id'] ]);
            return NULL;
        }

        if (!$activity->isActive())
        {
            \Log::warning('Activity not active', [ 'activity_id' => $activity->id ]);
            return NULL;
        }

        \Log::info('Activity QR Validated Successfully');
        return $activity;
    }

}
