<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\ActivityAttendance;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AttendanceService
{

    protected $signatureService;

    public function __construct(SignatureEncryptionService $signatureService)
    {

        $this->signatureService = $signatureService;
    }

    /**
     * Memvalidasi QR code, memeriksa signature, masa berlaku, dan status single-use.
     * Mengembalikan payload jika valid, null jika tidak.
     */
    public function validateAndParseQrCode(string $qrContent): ?array
    {

        try
        {
            $payload = json_decode($qrContent, TRUE);

            if (json_last_error() !== JSON_ERROR_NONE || !isset($payload['sig']))
            {
                Log::warning('QR Validation Failed: Invalid JSON or missing signature');

                return NULL;
            }

            if (!$this->signatureService->verify($payload))
            {
                Log::warning('QR Validation Failed: Invalid signature', [ 'payload' => $payload ]);
                return NULL;
            }

            if (!isset($payload['exp']) || Carbon::createFromTimestamp($payload['exp'])->isPast())
            {
                Log::warning('QR Validation Failed: Expired', [ 'payload' => $payload ]);
                return NULL;
            }

            if (isset($payload['usage']) && $payload['usage'] === 'single-use')
            {
                $cacheKey = 'used_qr_' . $payload['sig'];
                if (Cache::has($cacheKey))
                {
                    Log::warning('QR Validation Failed: Single-use QR has already been used', [ 'payload' => $payload ]);
                    return NULL;
                }
            }

            Log::info('QR Validation Succeeded', [ 'payload' => $payload ]);
            return $payload;

        } catch (\Exception $e)
        {
            Log::error('QR Validation Exception', [ 'error' => $e->getMessage() ]);
            return NULL;
        }
    }

    /**
     * Menangani proses check-in untuk absensi harian.
     */
    public function checkIn(User $user, int $attendanceTypeId, ?float $latitude, ?float $longitude, ?string $notes, array $payload): Attendance
    {

        // 1. Cek apakah pengguna sudah check-in untuk tipe absensi ini hari ini
        $existingAttendance = Attendance::where('user_id', $user->id)
            ->where('attendance_type_id', $attendanceTypeId)
            ->whereDate('check_in', today())
            ->first();

        if ($existingAttendance)
        {
            throw new \Exception('Anda sudah melakukan check-in untuk tipe absensi ini hari ini.');
        }

        // 2. Jika ini adalah QR sekali pakai (honorer), tandai sebagai sudah digunakan
        if (isset($payload['usage']) && $payload['usage'] === 'single-use')
        {
            $cacheKey      = 'used_qr_' . $payload['sig'];
            $expirySeconds = Carbon::createFromTimestamp($payload['exp'])->diffInSeconds(now());
            Cache::put($cacheKey, TRUE, $expirySeconds > 0 ? $expirySeconds : 1);
        }

        // 3. Buat catatan absensi baru
        $attendance = Attendance::create([
            'user_id'            => $user->id,
            'attendance_type_id' => $attendanceTypeId,
            'check_in'           => now(),
            'latitude'           => $latitude,
            'longitude'          => $longitude,
            'notes'              => $notes,
        ]);

        return $attendance;
    }

    /**
     * Menangani proses check-in untuk absensi kegiatan.
     */
    public function checkInActivity(User $user, int $activityId, ?float $latitude, ?float $longitude, ?string $notes): ActivityAttendance
    {

        $activity = Activity::findOrFail($activityId);

        // Cek apakah user sudah check-in di kegiatan ini
        $existing = ActivityAttendance::where('user_id', $user->id)
            ->where('activity_id', $activityId)
            ->whereDate('check_in', today())
            ->first();

        if ($existing)
        {
            throw new \Exception('Anda sudah melakukan check-in untuk kegiatan ini.');
        }

        return ActivityAttendance::create([
            'user_id'     => $user->id,
            'activity_id' => $activityId,
            'check_in'    => now(),
            'latitude'    => $latitude,
            'longitude'   => $longitude,
            'notes'       => $notes,
        ]);
    }

    public function checkOut(Attendance $attendance, ?float $latitude, ?float $longitude, ?string $notes): Attendance
    {

        if ($attendance->check_out)
        {
            throw new \Exception('Anda sudah melakukan check-out sebelumnya.');
        }

        $attendance->update([
            'check_out'     => now(),
            'latitude_out'  => $latitude, // Asumsi ada kolom latitude_out
            'longitude_out' => $longitude, // Asumsi ada kolom longitude_out
            'notes_out'     => $notes, // Asumsi ada kolom notes_out
        ]);

        return $attendance;
    }

    public function getUserAttendanceHistory(int $userId, ?string $startDate, ?string $endDate)
    {

        $query = Attendance::with('attendanceType')
            ->where('user_id', $userId)
            ->orderBy('check_in', 'desc');

        if ($startDate)
        {
            $query->whereDate('check_in', '>=', $startDate);
        }

        if ($endDate)
        {
            $query->whereDate('check_in', '<=', $endDate);
        }

        return $query->paginate(15);
    }

}
