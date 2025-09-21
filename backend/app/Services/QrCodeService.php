<?php

namespace App\Services;

use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class QrCodeService
{

    public function generateForUser($userId, $userEmail)
    {

        $qrData = [
            'user_id'   => $userId,
            'email'     => $userEmail,
            'timestamp' => now()->timestamp,
        ];

        $qrContent = json_encode($qrData);
        $fileName  = 'qr_codes/' . uniqid('qr_') . '.svg';

        // Generate QR code
        $qrCode = QrCode::size(300)
            ->generate($qrContent, storage_path('app/public/' . $fileName));

        return $fileName;
    }

    public function validateQRCode($qrContent)
    {

        try
        {
            $data = json_decode($qrContent, TRUE);

            // Check if QR code is valid and not expired (e.g., within 5 minutes)
            if (isset($data['timestamp']) && (now()->timestamp - $data['timestamp']) < 300)
            {
                return $data;
            }

            return NULL;
        } catch (\Exception $e)
        {
            return NULL;
        }
    }

}
