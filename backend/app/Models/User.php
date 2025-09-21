<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

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
        ];
    }

    public function generateQRCode()
    {

        $qrCode        = uniqid('QR_', TRUE);
        $this->qr_code = $qrCode;
        $this->save();

        return $qrCode;
    }

}
