<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityAttendance extends Model
{

    use HasFactory;

    protected $table = 'activity_attendance';

    protected $fillable = [
        'activity_id',
        'user_id',
        'check_in',
        'check_out',
        'latitude',
        'longitude',
        'notes',
        'is_late',
        'is_early',
        'qr_metadata' // Untuk menyimpan session token
    ];

    protected $casts = [
        'check_in'    => 'datetime',
        'check_out'   => 'datetime',
        'is_late'     => 'boolean',
        'is_early'    => 'boolean',
        'qr_metadata' => 'array',
    ];

    public function activity(): BelongsTo
    {

        return $this->belongsTo(Activity::class);
    }

    public function user(): BelongsTo
    {

        return $this->belongsTo(User::class);
    }

    /**
     * Scope untuk attendance yang aktif (belum check-out)
     */
    public function scopeActive($query)
    {

        return $query->whereNull('check_out');
    }

    /**
     * Scope untuk attendance hari ini
     */
    public function scopeToday($query)
    {

        return $query->whereDate('check_in', today());
    }

    /**
     * Scope untuk attendance user tertentu
     */
    public function scopeForUser($query, $userId)
    {

        return $query->where('user_id', $userId);
    }

}
