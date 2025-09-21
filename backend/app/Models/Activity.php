<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Activity extends Model
{

    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'start_time',
        'end_time',
        'is_recurring',
        'recurring_days',
        'valid_from',
        'valid_to',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'start_time'     => 'datetime:H:i:s',
        'end_time'       => 'datetime:H:i:s',
        'is_recurring'   => 'boolean',
        'recurring_days' => 'array',
        'valid_from'     => 'date',
        'valid_to'       => 'date',
        'is_active'      => 'boolean',
    ];

    public function creator(): BelongsTo
    {

        return $this->belongsTo(User::class, 'created_by');
    }

    public function attendees(): BelongsToMany
    {

        return $this->belongsToMany(User::class, 'activity_attendance')
            ->withPivot('check_in', 'check_out', 'latitude', 'longitude', 'notes', 'is_late', 'is_early')
            ->withTimestamps();
    }

    public function isActive(): bool
    {

        if (!$this->is_active)
        {
            return FALSE;
        }

        // Check validity period
        $now = now();
        if ($this->valid_from && $now->lt($this->valid_from))
        {
            return FALSE;
        }
        if ($this->valid_to && $now->gt($this->valid_to))
        {
            return FALSE;
        }

        // For recurring activities, check if today is valid day
        if ($this->is_recurring && $this->recurring_days)
        {
            $currentDay = $now->dayOfWeek;

            // 0 (Sunday) to 6 (Saturday)
            return in_array($currentDay, $this->recurring_days);
        }

        return TRUE;
    }

    public function generateQrCode(): string
    {

        $qrData = [
            'type'        => 'activity',
            'activity_id' => $this->id,
            'timestamp'   => now()->toISOString(),
            'expires_at'  => now()->addMinutes(30)->toISOString(), // 30 menit untuk kegiatan
            'version'     => 'v1',
        ];

        return json_encode($qrData);
    }

    public function scopeActive($query)
    {

        return $query->where('is_active', TRUE)
            ->where(function ($q)
            {
                $q->where('is_recurring', TRUE)
                    ->orWhere(function ($q)
                    {
                        $q->where('valid_from', '<=', now())
                            ->where('valid_to', '>=', now());
                    });
            });
    }

    public static function getActiveActivities()
    {

        return cache()->remember('active_activities', 300, function ()
        { // Cache 5 menit
            return static::active()->with('creator')->orderBy('name')->get();
        });
    }

    public static function clearActivitiesCache()
    {

        cache()->forget('active_activities');
    }

    // Tambahkan event listener untuk clear cache ketika data berubah
    protected static function booted()
    {

        static::saved(function ($activity)
        {
            static::clearActivitiesCache();
        });

        static::deleted(function ($activity)
        {
            static::clearActivitiesCache();
        });
    }

}
