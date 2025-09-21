<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{

    use HasFactory, SoftDeletes;

    protected $fillable = [
        'period',
        'attendance_type_id',
        'file_path',
        'is_signed',
        'signed_at',
        'signature_data',
    ];

    protected $casts = [
        'is_signed' => 'boolean',
        'signed_at' => 'datetime',
    ];

    public function attendanceType(): BelongsTo
    {

        return $this->belongsTo(AttendanceType::class);
    }

    public function scopePeriod($query, $period)
    {

        return $query->where('period', $period);
    }

    public function scopeSigned($query, $signed = TRUE)
    {

        return $query->where('is_signed', $signed);
    }

    public function scopeForAttendanceType($query, $attendanceTypeId)
    {

        return $query->where('attendance_type_id', $attendanceTypeId);
    }

    public function getDownloadUrlAttribute()
    {

        if (!$this->file_path)
        {
            return NULL;
        }

        return asset('storage/' . $this->file_path);
    }

    public function markAsSigned($signatureData)
    {

        $this->update([
            'is_signed'      => TRUE,
            'signed_at'      => now(),
            'signature_data' => $signatureData,
        ]);

        return $this;
    }

}
