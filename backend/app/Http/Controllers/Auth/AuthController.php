<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{

    /**
     * Handle user registration.
     */
    public function register(RegisterRequest $request)
    {

        $validated = $request->validated();

        $user = User::create([
            'name'          => $validated['name'],
            'email'         => $validated['email'],
            'password'      => Hash::make($validated['password']),
            'role'          => $validated['role'] ?? 'user',
            'employee_type' => $validated['employee_type'] ?? 'tetap',
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'user'         => $user,
        ], 201);
    }

    /**
     * Handle user login.
     */
    public function login(LoginRequest $request)
    {

        $credentials = $request->validated();

        // Manual authentication check untuk API
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password))
        {
            return response()->json([ 'error' => 'Unauthorized' ], 401);
        }

        // 2FA check dengan logic yang benar
        if ($user->google2fa_enabled)
        {
            // Jika 2FA enabled tapi tidak ada kode
            if (!isset($credentials['code']) || empty($credentials['code']))
            {
                return response()->json([
                    'error'        => '2FA code required',
                    'requires_2fa' => TRUE,
                ], 401);
            }

            // Verifikasi kode 2FA
            if (!$user->verifyTwoFactorCode($credentials['code']))
            {
                return response()->json([
                    'error'        => 'Invalid 2FA code',
                    'requires_2fa' => TRUE,
                ], 401);
            }
        }

        // Hapus token lama jika ada
        $user->tokens()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'user'         => $user,
        ]);
    }

    /**
     * Log the user out (Invalidate the token).
     */
    public function logout(Request $request)
    {

        $request->user()->currentAccessToken()->delete();

        return response()->json([ 'message' => 'User successfully signed out' ]);
    }

    /**
     * Get the authenticated User.
     */
    public function userProfile(Request $request)
    {

        return response()->json($request->user());
    }

    /**
     * Refresh a token.
     */
    public function refresh(Request $request)
    {

        $user = $request->user();
        $user->currentAccessToken()->delete(); // Hapus token current saja

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'user'         => $user, // Tambahkan user data juga
        ]);
    }

}
