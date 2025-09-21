<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{

    public function index(Request $request)
    {

        $query = User::query();

        // Search functionality
        if ($request->has('search') && !empty($request->search))
        {
            $search = $request->search;
            $query->where(function ($q) use ($search)
            {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('qr_code', 'like', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->per_page ?? 10;
        $users   = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data'         => $users->items(),
            'current_page' => $users->currentPage(),
            'last_page'    => $users->lastPage(),
            'per_page'     => $users->perPage(),
            'total'        => $users->total(),
            'from'         => $users->firstItem(),
            'to'           => $users->lastItem(),
        ]);
    }

    public function store(Request $request)
    {

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email',
            'password'   => 'required|string|min:6|confirmed',
            'role'       => [ 'required', Rule::in([ 'admin', 'user' ]) ],
            'is_honorer' => 'boolean',
        ]);

        $user = User::create([
            'name'       => $validated['name'],
            'email'      => $validated['email'],
            'password'   => Hash::make($validated['password']),
            'role'       => $validated['role'],
            'is_honorer' => $validated['is_honorer'] ?? FALSE,
        ]);

        // Generate QR code
        $user->generateQRCode();

        return response()->json($user, 201);
    }

    public function show(User $user)
    {

        return response()->json($user);
    }

    public function update(Request $request, User $user)
    {

        $validated = $request->validate([
            'name'       => 'sometimes|required|string|max:255',
            'email'      => [ 'sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id) ],
            'password'   => 'sometimes|nullable|string|min:6|confirmed',
            'role'       => [ 'sometimes', 'required', Rule::in([ 'admin', 'user' ]) ],
            'is_honorer' => 'boolean',
        ]);

        if (isset($validated['password']))
        {
            $validated['password'] = Hash::make($validated['password']);
        } else
        {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json($user);
    }

    public function destroy(User $user)
    {

        // Prevent deleting yourself
        if ($user->id === auth()->id())
        {
            return response()->json([ 'error' => 'Cannot delete your own account' ], 403);
        }

        $user->delete();

        return response()->json(NULL, 204);
    }

}
