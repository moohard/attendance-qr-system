<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityAttendance;
use App\Models\Attendance;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = Paginator::resolveCurrentPage('page');

        // --- Build Daily Attendance Query ---
        $dailyQuery = Attendance::with(['user', 'attendanceType']);

        // --- Build Activity Attendance Query ---
        $activityQuery = ActivityAttendance::with(['user', 'activity']);

        // --- Apply Common Filters ---
        $filters = [
            'user_id', 'is_late', 'is_early'
        ];

        foreach ($filters as $filter) {
            if ($request->has($filter)) {
                $dailyQuery->where($filter, $request->input($filter));
                $activityQuery->where($filter, $request->input($filter));
            }
        }

        // Date filters
        if ($request->has('date')) {
            $dailyQuery->whereDate('check_in', $request->date);
            $activityQuery->whereDate('check_in', $request->date);
        }
        if ($request->has('start_date')) {
            $dailyQuery->whereDate('check_in', '>=', $request->start_date);
            $activityQuery->whereDate('check_in', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $dailyQuery->whereDate('check_in', '<=', $request->end_date);
            $activityQuery->whereDate('check_in', '<=', $request->end_date);
        }

        // --- Handle Specific Filters ---
        $dailyAttendances = collect();
        $activityAttendances = collect();

        // If a specific activity is requested, only fetch that.
        if ($request->has('activity_id')) {
            $activityQuery->where('activity_id', $request->activity_id);
            $activityAttendances = $activityQuery->get();
        } 
        // If a specific attendance type is requested, only fetch that.
        else if ($request->has('attendance_type_id')) {
            $dailyQuery->where('attendance_type_id', $request->attendance_type_id);
            $dailyAttendances = $dailyQuery->get();
        } 
        // Otherwise, fetch from both.
        else {
            $dailyAttendances = $dailyQuery->get();
            $activityAttendances = $activityQuery->get();
        }

        // --- Merge & Paginate ---
        $dailyAttendances->each(function ($item) {
            $item->record_type = 'daily';
        });
        $activityAttendances->each(function ($item) {
            $item->record_type = 'activity';
        });

        $combined = $dailyAttendances->concat($activityAttendances);
        $sorted = $combined->sortByDesc('check_in');

        $paginatedResults = $sorted->slice(($page - 1) * $perPage, $perPage)->values();

        $paginator = new LengthAwarePaginator(
            $paginatedResults,
            $sorted->count(),
            $perPage,
            $page,
            ['path' => Paginator::resolveCurrentPath()]
        );

        return response()->json($paginator);
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
            'activity_id'        => 'nullable|exists:activities,id',
        ]);

        // --- Build Queries ---
        $dailyQuery = Attendance::with(['user', 'attendanceType']);
        $activityQuery = ActivityAttendance::with(['user', 'activity']);

        // --- Apply Common Filters ---
        $commonFilters = ['user_id'];
        foreach ($commonFilters as $filter) {
            if (isset($validated[$filter])) {
                $dailyQuery->where($filter, $validated[$filter]);
                $activityQuery->where($filter, $validated[$filter]);
            }
        }
        if (isset($validated['start_date'])) {
            $dailyQuery->whereDate('check_in', '>=', $validated['start_date']);
            $activityQuery->whereDate('check_in', '>=', $validated['start_date']);
        }
        if (isset($validated['end_date'])) {
            $dailyQuery->whereDate('check_in', '<=', $validated['end_date']);
            $activityQuery->whereDate('check_in', '<=', $validated['end_date']);
        }

        // --- Handle Specific Filters & Fetch ---
        $dailyAttendances = collect();
        $activityAttendances = collect();

        if (isset($validated['activity_id'])) {
            $activityQuery->where('activity_id', $validated['activity_id']);
            $activityAttendances = $activityQuery->get();
        } else if (isset($validated['attendance_type_id'])) {
            $dailyQuery->where('attendance_type_id', $validated['attendance_type_id']);
            $dailyAttendances = $dailyQuery->get();
        } else {
            $dailyAttendances = $dailyQuery->get();
            $activityAttendances = $activityQuery->get();
        }

        // --- Merge ---
        $dailyAttendances->each(fn($item) => $item->record_type = 'daily');
        $activityAttendances->each(fn($item) => $item->record_type = 'activity');
        $attendances = $dailyAttendances->concat($activityAttendances)->sortByDesc('check_in');

        // --- Generate Export ---
        if ($validated['format'] === 'csv' || $validated['format'] === 'excel') {
            return $this->exportToCSV($attendances);
        }

        // Fallback or other formats can be handled here
        return response()->json(['message' => 'Invalid format'], 400);
    }

    private function exportToCSV($attendances)
    {
        $fileName = 'attendances-' . date('Y-m-d') . '.csv';
        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ];

        $callback = function () use ($attendances) {
            $file = fopen('php://output', 'w');

            fputcsv($file, [
                'User Name', 'Email', 'Attendance Type', 'Check-in', 'Check-out', 'Duration (H:M)', 'Late', 'Early', 'Notes'
            ]);

            foreach ($attendances as $attendance) {
                $duration = $attendance->check_out ? gmdate('H:i', strtotime($attendance->check_out) - strtotime($attendance->check_in)) : '';
                $type = $attendance->record_type === 'activity'
                    ? ($attendance->activity->name ?? 'N/A')
                    : ($attendance->attendanceType->name ?? 'N/A');

                fputcsv($file, [
                    $attendance->user->name ?? 'N/A',
                    $attendance->user->email ?? 'N/A',
                    $type,
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
