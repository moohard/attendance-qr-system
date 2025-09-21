<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\Attendance;
use App\Models\AttendanceType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use PDF;

class ReportController extends Controller
{

    public function index(Request $request)
    {

        $query = Report::with('attendanceType');

        // Filter by period
        if ($request->has('period'))
        {
            $query->where('period', $request->period);
        }

        // Filter by signed status
        if ($request->has('is_signed'))
        {
            $query->where('is_signed', $request->boolean('is_signed'));
        }

        // Date range filters
        if ($request->has('start_date'))
        {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date'))
        {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $perPage = $request->per_page ?? 10;
        $reports = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data'         => $reports->items(),
            'current_page' => $reports->currentPage(),
            'last_page'    => $reports->lastPage(),
            'per_page'     => $reports->perPage(),
            'total'        => $reports->total(),
        ]);
    }

    public function generate(Request $request)
    {

        $validated = $request->validate([
            'period'             => 'required|date_format:Y-m',
            'attendance_type_id' => 'nullable|exists:attendance_types,id',
            'format'             => 'nullable|in:pdf,excel',
        ]);

        // Generate report data
        $reportData = $this->generateReportData($validated['period'], $validated['attendance_type_id'] ?? NULL);

        // Create report record
        $report = Report::create([
            'period'             => $validated['period'],
            'attendance_type_id' => $validated['attendance_type_id'],
            'file_path'          => NULL, // Will be updated after file generation
            'is_signed'          => FALSE,
        ]);

        // Generate PDF file
        $fileName = "report-{$validated['period']}-" . ($validated['attendance_type_id'] ?: 'all') . '.pdf';
        $filePath = "reports/{$fileName}";

        $pdf = PDF::loadView('reports.attendance', $reportData);
        Storage::put($filePath, $pdf->output());

        // Update report with file path
        $report->update([ 'file_path' => $filePath ]);

        return response()->json($report->load('attendanceType'));
    }

    public function download($id)
    {

        $report = Report::findOrFail($id);

        if (!$report->file_path || !Storage::exists($report->file_path))
        {
            return response()->json([ 'error' => 'Report file not found' ], 404);
        }

        return Storage::download($report->file_path, "report-{$report->period}.pdf");
    }

    public function sign(Request $request, $id)
    {

        $validated = $request->validate([
            'signature_data' => 'required|string',
        ]);

        $report = Report::findOrFail($id);

        $report->update([
            'is_signed'      => TRUE,
            'signed_at'      => now(),
            'signature_data' => $validated['signature_data'],
        ]);

        return response()->json($report);
    }

    private function generateReportData($period, $attendanceTypeId = NULL)
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
