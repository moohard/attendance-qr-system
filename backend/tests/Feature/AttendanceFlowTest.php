<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\AttendanceType;
use App\Models\Activity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCaseHelper;

class AttendanceFlowTest extends TestCase
{

    use RefreshDatabase, TestCaseHelper;

    protected $user;

    protected $attendanceType;

    protected $activity;

    protected function setUp(): void
    {

        parent::setUp();

        $this->user = User::factory()->create([
            'email'    => 'testuser@example.com',
            'password' => bcrypt('password123'),
        ]);

        $this->attendanceType = AttendanceType::create([
            'name'        => 'Shift Pagi',
            'start_time'  => '07:00:00',
            'end_time'    => '16:00:00',
            'description' => 'Shift kerja pagi',
        ]);

        $this->activity = Activity::create([
            'name'           => 'Apel Pagi',
            'description'    => 'Apel pagi seluruh staff',
            'start_time'     => '07:30:00',
            'end_time'       => '08:00:00',
            'is_recurring'   => TRUE,
            'recurring_days' => [ 1, 2, 3, 4, 5 ],
            'is_active'      => TRUE,
            'created_by'     => $this->user->id,
        ]);
    }

    public function test_complete_attendance_flow()
    {

        // Step 1: Login
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'testuser@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $token = $response->json('access_token');

        // Step 2: Generate valid QR Code dengan waktu yang tepat
        $qrData = [
            'type'               => 'user_checkin',
            'user_id'            => $this->user->id,
            'timestamp'          => now()->subSeconds(2)->toISOString(), // 2 detik yang lalu (bukan sekarang)
            'expires_at'         => now()->addMinutes(5)->toISOString(), // 5 menit dari sekarang
            'attendance_type_id' => $this->attendanceType->id,
            'version'            => 'v1',
        ];

        \Log::info('Test QR Data Generated', $qrData);

        // Step 3: Check-in menggunakan QR code
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/attendance/check-in', [
                    'qr_content'         => json_encode($qrData),
                    'attendance_type_id' => $this->attendanceType->id,
                ]);

        // Debug detailed response
        $this->debugResponse($response, 'Check-in attempt with valid QR');

        if ($response->getStatusCode() !== 201)
        {
            // Check log untuk detail error
            \Log::error('Check-in failed in test', [
                'status'   => $response->getStatusCode(),
                'response' => $response->json(),
                'qr_data'  => $qrData,
            ]);
        }

        $response->assertStatus(201);
        $attendanceData = $response->json('attendance');
        $this->assertNotNull($attendanceData);

        $attendanceId = $attendanceData['id'];
        \Log::info('Check-in successful', [ 'attendance_id' => $attendanceId ]);

        // ... rest of the test
    }

    public function test_activity_attendance_flow()
    {

        // Login
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'testuser@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $token = $response->json('access_token');

        // Generate valid activity QR code
        $now            = Carbon::now();
        $activityQrData = [
            'type'        => 'activity',
            'activity_id' => $this->activity->id,
            'timestamp'   => $now->toISOString(),
            'expires_at'  => $now->copy()->addMinutes(30)->toISOString(),
            'version'     => 'v1',
        ];

        // Check-in to activity - FIXED: Gunakan route yang benar
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/activities/checkin', [ // Fixed route name
                    'qr_content' => json_encode($activityQrData),
                ]);

        // Debug response
        if ($response->getStatusCode() !== 201)
        {
            dump('Activity check-in failed:', $response->json());
        }

        $response->assertStatus(201);
    }

    public function test_late_attendance_detection()
    {

        // Set waktu untuk testing late attendance (8:00 AM - late for 7:00 shift)
        Carbon::setTestNow(Carbon::today()->setTime(8, 0, 0));

        // Login first
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'testuser@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $token = $response->json('access_token');

        // Generate QR code dengan waktu sekarang (8:00 AM)
        $now    = Carbon::now();
        $qrData = [
            'type'               => 'user_checkin',
            'user_id'            => $this->user->id,
            'timestamp'          => $now->toISOString(),
            'expires_at'         => $now->copy()->addMinutes(5)->toISOString(),
            'attendance_type_id' => $this->attendanceType->id,
            'version'            => 'v1',
        ];

        $response = $this->withHeaders([
            'Authorization' => "Bearer $token",
        ])->postJson('/api/attendance/check-in', [
                    'qr_content'         => json_encode($qrData),
                    'attendance_type_id' => $this->attendanceType->id,
                ]);

        $this->debugResponse($response, 'Late attendance test failed');

        $response->assertStatus(201);

        // Verify late detection
        $attendanceData = $response->json('attendance');
        $this->assertTrue($attendanceData['is_late'], 'Late attendance should be detected');

        // Reset time
        Carbon::setTestNow();
    }

    public function test_qr_code_validation()
    {

        // Login
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'testuser@example.com',
            'password' => 'password123',
        ]);

        $token = $response->json('access_token');

        // Test dengan QR code yang expired
        $expiredQrData = [
            'type'               => 'user_checkin',
            'user_id'            => $this->user->id,
            'timestamp'          => Carbon::now()->subMinutes(10)->toISOString(), // 10 menit yang lalu
            'expires_at'         => Carbon::now()->subMinutes(5)->toISOString(), // Expired 5 menit yang lalu
            'attendance_type_id' => $this->attendanceType->id,
            'version'            => 'v1',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/attendance/check-in', [
                    'qr_content'         => json_encode($expiredQrData),
                    'attendance_type_id' => $this->attendanceType->id,
                ]);

        // Should fail dengan expired QR
        $response->assertStatus(400);
    }

}
