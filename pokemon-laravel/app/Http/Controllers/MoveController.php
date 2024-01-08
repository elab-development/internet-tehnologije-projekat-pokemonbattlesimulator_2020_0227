<?php

namespace App\Http\Controllers;

use App\Http\Resources\MoveCollection;
use App\Http\Resources\MoveResource;
use App\Models\Move;
use Illuminate\Http\Request;

class MoveController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return new MoveCollection(Move::paginate());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $move = Move::find($id);
        if(is_null($move)){
            return response()->json([
                'message'=>'Data not found'
            ],404);
        }
        return new MoveResource($move);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
