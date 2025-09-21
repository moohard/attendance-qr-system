<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorAuthController extends Controller
{

    public function enable(Request $request)
    {

        $user = $request->user();

        if ($user->google2fa_enabled)
        {
            return response()->json([ 'error' => '2FA is already enabled' ], 400);
        }

        $secret = $user->enableTwoFactorAuth();

        return response()->json([
            'secret'      => $secret,
            'qr_code_url' => $user->getTwoFactorQrCodeUrl(),
            'message'     => '2FA enabled successfully. Please verify with your authenticator app.',
        ]);
    }

    public function disable(Request $request)
    {

        $user = $request->user();
        $user->disableTwoFactorAuth();

        return response()->json([ 'message' => '2FA disabled successfully' ]);
    }

    public function verify(Request $request)
    {

        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (!$user->verifyTwoFactorCode($request->code))
        {
            return response()->json([ 'error' => 'Invalid verification code' ], 400);
        }

        // Store verification in session for this request
        session([ '2fa_verified' => TRUE ]);

        return response()->json([ 'message' => '2FA verification successful' ]);
    }

    public function status(Request $request)
    {

        $user = $request->user();

        return response()->json([
            'enabled'     => $user->google2fa_enabled,
            'qr_code_url' => $user->getTwoFactorQrCodeUrl(),
        ]);
    }

}
