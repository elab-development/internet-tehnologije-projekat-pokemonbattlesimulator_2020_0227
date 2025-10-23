<?php

namespace App\Http\Controllers;

use App\Filters\MoveFilter;
use App\Http\Requests\DeleteMoveRequest;
use App\Http\Requests\StoreMoveRequest;
use App\Http\Requests\UpdateMoveRequest;
use App\Http\Resources\MoveCollection;
use App\Http\Resources\MoveResource;
use App\Models\Move;
use Illuminate\Http\Request;

class MoveController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filter = new MoveFilter();
        $filterItems = $filter->transform($request); //?column[operator]=value

        $moves = Move::where($filterItems);

        return new MoveCollection(
            $moves->paginate(PokemonController::PAGINATION_AMOUNT)->appends($request->query())
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMoveRequest $request)
    {
        return new MoveResource(Move::create($request->all()));
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $move = Move::find($id);
        if (is_null($move)) {
            return response()->json([
                'message' => 'Data not found'
            ], 404);
        }
        return new MoveResource($move);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMoveRequest $request, Move $move)
    {
        $move->update($request->all());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DeleteMoveRequest $request, string $id)
    {
        Move::destroy($id);
    }
}
