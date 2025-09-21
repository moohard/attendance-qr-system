<?php

namespace App\Models;

use PragmaRX\Google2FA\Google2FA;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

// <- Tambahkan ini

class User extends Authenticatable
{

    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    // <- Tambahkan HasApiTokens

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'qr_code',
        'is_honorer',
        'google2fa_secret',
        'google2fa_enabled',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {

        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_honorer'        => 'boolean',
            'google2fa_enabled' => 'boolean',

        ];
    }

    public function attendances(): HasMany
    {

        return $this->hasMany(Attendance::class);
    }

    /**
     * Get all reports for the user (jika perlu).
     */
    public function reports(): HasMany
    {

        return $this->hasMany(Report::class);
    }

    public function generateQRCode()
    {

        $qrCode        = uniqid('QR_', TRUE);
        $this->qr_code = $qrCode;
        $this->save();

        return $qrCode;
    }

    public function enableTwoFactorAuth()
    {

        $google2fa = new Google2FA();

        if (!$this->google2fa_secret)
        {
            $this->google2fa_secret = $google2fa->generateSecretKey(16);
        }

        $this->google2fa_enabled = TRUE;
        $this->save();

        return $this->google2fa_secret;
    }

    public function disableTwoFactorAuth()
    {

        $this->google2fa_enabled = FALSE;
        $this->google2fa_secret  = NULL;
        $this->save();
    }

    public function getTwoFactorQrCodeUrl()
    {

        if (!$this->google2fa_secret)
        {
            return NULL;
        }

        $google2fa = new Google2FA();
        return $google2fa->getQRCodeUrl(
            config('app.name'),
            $this->email,
            $this->google2fa_secret,
        );
    }

    public function verifyTwoFactorCode($code)
    {

        if (!$this->google2fa_secret || !$this->google2fa_enabled)
        {
            return FALSE;
        }

        $google2fa = new Google2FA();
        return $google2fa->verifyKey($this->google2fa_secret, $code, 2);
    }

}
