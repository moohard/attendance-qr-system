<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreActivityRequest;
use App\Http\Requests\Admin\UpdateActivityRequest;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        // Ambil semua kegiatan, termasuk yang tidak aktif
        $activities = Activity::with('creator')->latest()->paginate(15);

        return response()->json($activities);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreActivityRequest $request)
    {

        $validated               = $request->validated();
        $validated['created_by'] = Auth::id();

        $activity = Activity::create($validated);

        return response()->json($activity, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Activity $activity)
    {

        return response()->json($activity->load('creator'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateActivityRequest $request, Activity $activity)
    {

        $validated = $request->validated();
        $activity->update($validated);

        return response()->json($activity);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Activity $activity)
    {

        // Hanya creator yang bisa menghapus
        if ($activity->created_by !== Auth::id())
        {
            return response()->json([ 'error' => 'Unauthorized' ], 403);
        }

        $activity->delete();

        return response()->json(NULL, 204);
    }

}
