<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{

    use HasFactory;

    protected $fillable = [
        'user_id',
        'attendance_type_id',
        'check_in',
        'check_out',
        'latitude',
        'longitude',
        'notes',
        'is_late',
        'is_early',
    ];

    protected $casts = [
        'check_in'  => 'datetime',
        'check_out' => 'datetime',
        'is_late'   => 'boolean',
        'is_early'  => 'boolean',
    ];

    public function user(): BelongsTo
    {

        return $this->belongsTo(User::class);
    }

    public function attendanceType(): BelongsTo
    {

        return $this->belongsTo(AttendanceType::class);
    }

}
