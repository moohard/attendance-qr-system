<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Report;
use App\Models\AttendanceType;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ReportTest extends TestCase
{

    use RefreshDatabase;

    public function test_can_create_report()
    {

        $report = Report::create([
            'period'    => '2024-01',
            'file_path' => 'reports/test.pdf',
            'is_signed' => FALSE,
        ]);

        $this->assertModelExists($report);
        $this->assertEquals('2024-01', $report->period);
        $this->assertFalse($report->is_signed);
    }

    public function test_report_belongs_to_attendance_type()
    {

        $attendanceType = AttendanceType::create([
            'name'       => 'Test Shift',
            'start_time' => '08:00:00',
            'end_time'   => '17:00:00',
        ]);

        $report = Report::create([
            'period'             => '2024-01',
            'attendance_type_id' => $attendanceType->id,
            'file_path'          => 'reports/test.pdf',
        ]);

        $this->assertInstanceOf(AttendanceType::class, $report->attendanceType);
        $this->assertEquals('Test Shift', $report->attendanceType->name);
    }

    public function test_can_mark_report_as_signed()
    {

        $report = Report::create([
            'period'    => '2024-01',
            'file_path' => 'reports/test.pdf',
            'is_signed' => FALSE,
        ]);

        $report->markAsSigned('signature-data');

        $this->assertTrue($report->fresh()->is_signed);
        $this->assertNotNull($report->fresh()->signed_at);
        $this->assertEquals('signature-data', $report->fresh()->signature_data);
    }

    public function test_scope_period()
    {

        Report::create([ 'period' => '2024-01', 'file_path' => 'test1.pdf' ]);
        Report::create([ 'period' => '2024-02', 'file_path' => 'test2.pdf' ]);

        $reports = Report::period('2024-01')->get();

        $this->assertCount(1, $reports);
        $this->assertEquals('2024-01', $reports->first()->period);
    }

}
