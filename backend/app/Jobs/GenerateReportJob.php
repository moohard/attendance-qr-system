<?php

namespace App\Jobs;

use App\Models\Report;
use App\Models\Attendance;
use App\Models\AttendanceType;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class GenerateReportJob implements ShouldQueue
{

    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected array $data,
        protected int $userId,
    ) {

    }

    public function handle()
    {

        $period           = $this->data['period'];
        $attendanceTypeId = $this->data['attendance_type_id'] ?? NULL;

        // Create report record first
        $report = Report::create([
            'period'             => $period,
            'attendance_type_id' => $attendanceTypeId,
            'file_path'          => NULL,
            'is_signed'          => FALSE,
        ]);

        try
        {
            // Generate report data
            $reportData = $this->generateReportData($period, $attendanceTypeId);

            // Generate PDF
            $fileName = "report-{$period}-" . ($attendanceTypeId ?: 'all') . '-' . now()->format('YmdHis') . '.pdf';
            $filePath = "reports/{$fileName}";

            $pdf = PDF::loadView('reports.attendance', $reportData);
            Storage::disk('public')->put($filePath, $pdf->output());

            // Update report with file path
            $report->update([ 'file_path' => $filePath ]);

        } catch (\Exception $e)
        {
            // Log error and mark report as failed
            \Log::error("Report generation failed: " . $e->getMessage());
            $report->update([ 'file_path' => 'failed' ]);
            throw $e;
        }
    }

    protected function generateReportData($period, $attendanceTypeId = NULL)
    {

        $startDate = \Carbon\Carbon::parse($period)->startOfMonth();
        $endDate   = \Carbon\Carbon::parse($period)->endOfMonth();

        $query = Attendance::with([ 'user', 'attendanceType' ])
            ->whereBetween('check_in', [ $startDate, $endDate ]);

        if ($attendanceTypeId)
        {
            $query->where('attendance_type_id', $attendanceTypeId);
        }

        $attendances = $query->get();

        $attendanceType = $attendanceTypeId
            ? AttendanceType::find($attendanceTypeId)
            : NULL;

        return [
            'attendances'    => $attendances,
            'period'         => $period,
            'attendanceType' => $attendanceType,
            'total_records'  => $attendances->count(),
            'generated_at'   => now(),
        ];
    }

}
