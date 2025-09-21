<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{

    public function index(Request $request)
    {

        $query = Attendance::with([ 'user', 'attendanceType' ]);

        // Apply filters
        if ($request->has('user_id'))
        {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('attendance_type_id'))
        {
            $query->where('attendance_type_id', $request->attendance_type_id);
        }

        if ($request->has('date'))
        {
            $query->whereDate('check_in', $request->date);
        }

        if ($request->has('start_date'))
        {
            $query->whereDate('check_in', '>=', $request->start_date);
        }

        if ($request->has('end_date'))
        {
            $query->whereDate('check_in', '<=', $request->end_date);
        }

        if ($request->has('is_late'))
        {
            $query->where('is_late', $request->boolean('is_late'));
        }

        if ($request->has('is_early'))
        {
            $query->where('is_early', $request->boolean('is_early'));
        }

        $perPage     = $request->per_page ?? 10;
        $attendances = $query->orderBy('check_in', 'desc')->paginate($perPage);

        return response()->json([
            'data'         => $attendances->items(),
            'current_page' => $attendances->currentPage(),
            'last_page'    => $attendances->lastPage(),
            'per_page'     => $attendances->perPage(),
            'total'        => $attendances->total(),
        ]);
    }

    public function show(Attendance $attendance)
    {

        return response()->json($attendance->load([ 'user', 'attendanceType' ]));
    }

    public function update(Request $request, Attendance $attendance)
    {

        $validated = $request->validate([
            'check_in'  => 'sometimes|date',
            'check_out' => 'sometimes|nullable|date',
            'notes'     => 'sometimes|nullable|string|max:500',
            'is_late'   => 'sometimes|boolean',
            'is_early'  => 'sometimes|boolean',
        ]);

        $attendance->update($validated);

        return response()->json($attendance->load([ 'user', 'attendanceType' ]));
    }

    public function destroy(Attendance $attendance)
    {

        $attendance->delete();

        return response()->json(NULL, 204);
    }

    public function export(Request $request)
    {

        $validated = $request->validate([
            'format'             => 'required|in:csv,excel',
            'start_date'         => 'nullable|date',
            'end_date'           => 'nullable|date|after_or_equal:start_date',
            'user_id'            => 'nullable|exists:users,id',
            'attendance_type_id' => 'nullable|exists:attendance_types,id',
        ]);

        $query = Attendance::with([ 'user', 'attendanceType' ]);

        // Apply filters
        if ($request->has('start_date'))
        {
            $query->whereDate('check_in', '>=', $validated['start_date']);
        }

        if ($request->has('end_date'))
        {
            $query->whereDate('check_in', '<=', $validated['end_date']);
        }

        if ($request->has('user_id'))
        {
            $query->where('user_id', $validated['user_id']);
        }

        if ($request->has('attendance_type_id'))
        {
            $query->where('attendance_type_id', $validated['attendance_type_id']);
        }

        $attendances = $query->orderBy('check_in', 'desc')->get();

        // Generate CSV
        if ($validated['format'] === 'csv')
        {
            return $this->exportToCSV($attendances);
        }

        // Generate Excel (basic CSV for now)
        return $this->exportToCSV($attendances);
    }

    private function exportToCSV($attendances)
    {

        $fileName = 'attendances-' . date('Y-m-d') . '.csv';

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ];

        $callback = function () use ($attendances)
        {
            $file = fopen('php://output', 'w');

            // CSV header
            fputcsv($file, [
                'User Name',
                'Email',
                'Attendance Type',
                'Check-in',
                'Check-out',
                'Duration',
                'Late',
                'Early',
                'Notes',
            ]);

            // CSV data
            foreach ($attendances as $attendance)
            {
                $duration = $attendance->check_out
                    ? gmdate('H:i', strtotime($attendance->check_out) - strtotime($attendance->check_in))
                    : '';

                fputcsv($file, [
                    $attendance->user->name,
                    $attendance->user->email,
                    $attendance->attendanceType->name,
                    $attendance->check_in,
                    $attendance->check_out,
                    $duration,
                    $attendance->is_late ? 'Yes' : 'No',
                    $attendance->is_early ? 'Yes' : 'No',
                    $attendance->notes,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

}
