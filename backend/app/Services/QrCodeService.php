<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\User;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class QrCodeService
{

    protected $signatureService;

    // Durasi kadaluarsa dalam menit
    private const EXPIRY_HONORER     = 2;

    // 2 menit untuk honorer
    private const EXPIRY_NON_HONORER = 10;

    // 10 menit untuk non-honorer
    private const EXPIRY_ACTIVITY    = 60;

    // 60 menit untuk kegiatan

    public function __construct(SignatureEncryptionService $signatureService)
    {

        $this->signatureService = $signatureService;
    }

    /**
     * Membuat data QR code untuk absensi harian pengguna.
     * Logika membedakan honorer dan non-honorer ada di sini.
     */
    public function generateForUser(User $user): array
    {

        $isHonorer = ($user->employee_type === 'honorer');

        $expiryMinutes = $isHonorer ? self::EXPIRY_HONORER : self::EXPIRY_NON_HONORER;
        $usageType     = $isHonorer ? 'single-use' : 'multi-use';

        $payload = [
            'type'    => 'daily',
            'usage'   => $usageType,
            'user_id' => $user->id,
        ];

        return $this->generate($payload, $expiryMinutes);
    }

    /**
     * Membuat data QR code untuk absensi sebuah kegiatan.
     */
    public function generateForActivity(Activity $activity): array
    {

        $payload = [
            'type'        => 'activity',
            'activity_id' => $activity->id,
        ];

        // Absensi kegiatan selalu multi-use dalam rentang waktu validnya
        // dan memiliki waktu kadaluarsa yang lebih lama.
        return $this->generate($payload, self::EXPIRY_ACTIVITY);
    }

    /**
     * Mesin utama untuk membuat payload QR code, menandatanganinya, dan membuat gambar SVG.
     */
    private function generate(array $payload, int $expiryMinutes): array
    {

        $issuedAt  = now();
        $expiresAt = $issuedAt->copy()->addMinutes($expiryMinutes);

        // Menambahkan timestamp ke payload
        $payload['iat'] = $issuedAt->timestamp;
        $payload['exp'] = $expiresAt->timestamp;

        // Menambahkan signature ke payload
        $signature      = $this->signatureService->sign($payload);
        $payload['sig'] = $signature;

        // Mengubah payload menjadi string JSON
        $jsonPayload = json_encode($payload);

        // Membuat gambar QR code dari string JSON
        $renderer = new ImageRenderer(
            new RendererStyle(400),
            new SvgImageBackEnd(),
        );
        $writer   = new Writer($renderer);
        $qrImage  = $writer->writeString($jsonPayload);

        return [
            'qr_code_svg' => base64_encode($qrImage), // Kirim sebagai base64 agar mudah ditampilkan di frontend
            'qr_content'  => $jsonPayload,
            'expires_at'  => $expiresAt->toIso8601String(),
        ];
    }

}
