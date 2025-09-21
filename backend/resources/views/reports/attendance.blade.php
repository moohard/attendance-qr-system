<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Attendance Report - {{ $period }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .table {
            width: 100%;
            border-collapse: collapse;
        }

        .table th,
        .table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        .table th {
            background-color: #f2f2f2;
        }

        .footer {
            margin-top: 30px;
            text-align: right;
            font-size: 12px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Attendance Report</h1>
        <h2>Period: {{ $period }}</h2>
        @if ($attendanceType)
            <h3>Type: {{ $attendanceType->name }}</h3>
        @endif
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>User</th>
                <th>Email</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Duration</th>
                <th>Late</th>
                <th>Early</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($attendances as $attendance)
                <tr>
                    <td>{{ $attendance->user->name }}</td>
                    <td>{{ $attendance->user->email }}</td>
                    <td>{{ $attendance->check_in->format('Y-m-d H:i') }}</td>
                    <td>{{ $attendance->check_out ? $attendance->check_out->format('Y-m-d H:i') : '-' }}</td>
                    <td>
                        @if ($attendance->check_out)
                            {{ gmdate('H:i', strtotime($attendance->check_out) - strtotime($attendance->check_in)) }}
                        @endif
                    </td>
                    <td>{{ $attendance->is_late ? 'Yes' : 'No' }}</td>
                    <td>{{ $attendance->is_early ? 'Yes' : 'No' }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Total Records: {{ $total_records }}</p>
        <p>Generated: {{ $generated_at->format('Y-m-d H:i') }}</p>
    </div>
</body>

</html>
