<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{

    public function register(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users',
            'password'   => 'required|string|min:6|confirmed',
            'role'       => 'sometimes|in:admin,user',
            'is_honorer' => 'sometimes|boolean',
        ]);

        if ($validator->fails())
        {
            return response()->json($validator->errors(), 422);
        }

        $user = User::create([
            'name'       => $request->name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'role'       => $request->role ?? 'user',
            'is_honorer' => $request->is_honorer ?? FALSE,
        ]);

        // Generate QR code
        $user->generateQRCode();

        // Create API token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'User successfully registered',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    public function login(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails())
        {
            return response()->json($validator->errors(), 422);
        }

        // Gunakan Auth::validate() untuk memvalidasi credentials
        if (!Auth::guard('web')->validate($request->only('email', 'password')))
        {
            return response()->json([ 'error' => 'Unauthorized' ], 401);
        }

        // Dapatkan user berdasarkan email
        $user = User::where('email', $request->email)->first();

        if (!$user)
        {
            return response()->json([ 'error' => 'User not found' ], 404);
        }

        // Create API token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'user'         => $user,
        ]);
    }

    public function logout(Request $request)
    {

        // Hapus current access token
        $request->user()->currentAccessToken()->delete();

        return response()->json([ 'message' => 'User successfully signed out' ]);
    }

    public function userProfile(Request $request)
    {

        return response()->json($request->user());
    }

    public function refresh(Request $request)
    {

        // Hapus token lama dan buat token baru
        $request->user()->currentAccessToken()->delete();
        $token = $request->user()->createToken('auth-token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
        ]);
    }

}
