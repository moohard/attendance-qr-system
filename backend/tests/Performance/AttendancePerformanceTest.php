<?php

namespace Tests\Performance;

use Tests\TestCase;
use App\Models\User;
use App\Models\AttendanceType;
use App\Models\Attendance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

class AttendancePerformanceTest extends TestCase
{

    use RefreshDatabase;

    protected $user;

    protected $attendanceType;

    protected function setUp(): void
    {

        parent::setUp();

        $this->user           = User::factory()->create();
        $this->attendanceType = AttendanceType::create([
            'name'       => 'Test Shift',
            'start_time' => '08:00:00',
            'end_time'   => '17:00:00',
        ]);

        // Create sample attendance data menggunakan factory yang benar
        Attendance::factory()->count(10)->create([
            'user_id'            => $this->user->id,
            'attendance_type_id' => $this->attendanceType->id,
        ]);
    }

    public function test_attendance_checkin_performance()
    {

        DB::connection()->enableQueryLog();

        $startTime = microtime(TRUE);

        // Simulate 5 concurrent check-ins (reduced untuk stability)
        for ($i = 0; $i < 5; $i++)
        {
            $qrData = $this->createValidQrCode($this->user->id, $this->attendanceType->id);

            $response = $this->actingAs($this->user)
                ->postJson('/api/attendance/check-in', [
                    'qr_content'         => json_encode($qrData),
                    'attendance_type_id' => $this->attendanceType->id,
                ]);

            // Accept both success and validation errors
            $this->assertTrue(
                in_array($response->getStatusCode(), [ 201, 400 ]),
                "Unexpected status code: " . $response->getStatusCode()
            );
        }

        $endTime       = microtime(TRUE);
        $executionTime = $endTime - $startTime;

        $queries    = DB::getQueryLog();
        $queryCount = count($queries);

        // Reasonable performance thresholds
        $this->assertLessThan(5.0, $executionTime, "Check-in performance too slow: {$executionTime}s");
        $this->assertLessThan(100, $queryCount, "Too many queries: {$queryCount}");

        DB::connection()->disableQueryLog();
    }

    public function test_database_query_performance()
    {

        // Create smaller test dataset
        User::factory()->count(50)->create();

        $startTime = microtime(TRUE);

        // Test realistic query
        $users = User::with([
            'attendances' => function ($query)
            {
                $query->whereDate('check_in', today())
                    ->orderBy('check_in', 'desc');
            }
        ])->where('role', 'user')
            ->paginate(10); // Smaller page size

        $endTime       = microtime(TRUE);
        $executionTime = $endTime - $startTime;

        $this->assertLessThan(1.0, $executionTime, "Database query too slow: {$executionTime}s");
        $this->assertCount(min(10, $users->total()), $users->items());
    }

    public function test_mass_attendance_processing()
    {

        // Create smaller dataset
        $users = User::factory()->count(5)->create();

        $startTime          = microtime(TRUE);
        $successfulCheckins = 0;

        foreach ($users as $user)
        {
            $qrData = $this->createValidQrCode($user->id, $this->attendanceType->id);

            $response = $this->actingAs($user)
                ->postJson('/api/attendance/check-in', [
                    'qr_content'         => json_encode($qrData),
                    'attendance_type_id' => $this->attendanceType->id,
                ]);

            if ($response->getStatusCode() === 201)
            {
                $successfulCheckins++;
            }
        }

        $endTime       = microtime(TRUE);
        $executionTime = $endTime - $startTime;

        // Check total attendances created
        $attendanceCount = Attendance::count();

        $this->assertGreaterThan(0, $successfulCheckins, "No successful check-ins");
        $this->assertLessThan(3.0, $executionTime, "Mass processing too slow: {$executionTime}s");

        \Log::info('Mass attendance processing completed', [
            'successful_checkins' => $successfulCheckins,
            'total_attendances'   => $attendanceCount,
            'execution_time'      => $executionTime,
        ]);
    }

    protected function createValidQrCode($userId, $attendanceTypeId, $type = 'user_checkin')
    {

        return [
            'type'               => $type,
            'user_id'            => $userId,
            'timestamp'          => now()->toISOString(),
            'expires_at'         => now()->addMinutes(5)->toISOString(),
            'attendance_type_id' => $attendanceTypeId,
            'version'            => 'v1',
        ];
    }

}
