<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Services\QrCodeService;
use Illuminate\Http\Request;

class QrCodeController extends Controller
{

    protected $qrCodeService;

    public function __construct(QrCodeService $qrCodeService)
    {

        $this->qrCodeService = $qrCodeService;
    }

    /**
     * Membuat QR code untuk absensi harian (check-in/check-out).
     */
    public function generateDailyQr(Request $request)
    {

        $user       = $request->user();
        $qrCodeData = $this->qrCodeService->generateForUser($user);

        return response()->json($qrCodeData);
    }

    /**
     * Membuat QR code untuk absensi kegiatan.
     * Hanya admin atau pembuat kegiatan yang bisa membuat ini.
     */
    public function generateActivityQr(Request $request, Activity $activity)
    {

        // Otorisasi: Hanya admin atau pembuat kegiatan
        if ($request->user()->role !== 'admin' && $activity->created_by !== $request->user()->id)
        {
            return response()->json([ 'error' => 'Unauthorized' ], 403);
        }

        $qrCodeData = $this->qrCodeService->generateForActivity($activity);

        return response()->json($qrCodeData);
    }

}
