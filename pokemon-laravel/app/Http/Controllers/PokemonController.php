<?php

namespace App\Http\Controllers;

use App\Http\Resources\PokemonCollection;
use App\Http\Resources\PokemonResource;
use App\Models\Pokemon;
use App\Filters\PokemonFilter;
use Illuminate\Http\Request;

class PokemonController extends Controller
{

    public const PAGINATION_AMOUNT = 10;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filter = new PokemonFilter();
        $filterItems = $filter->transform($request); //?column[operator]=value
        $includeMoves = $request->query('includeMoves');
        
        $pokemons = Pokemon::where($filterItems);

        if($includeMoves){
            $pokemons = $pokemons->with('moves');
        }

        //$pokemons = Pokemon::where($filterItems)->paginate(PokemonController::PAGINATION_AMOUNT);

        return new PokemonCollection(
            $pokemons->paginate(PokemonController::PAGINATION_AMOUNT)->appends($request->query())
        );
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
        $pokemon = Pokemon::find($id);
        if (is_null($pokemon)) {
            return response()->json([
                'message' => 'Data not found'
            ], 404);
        }

        return new PokemonResource($pokemon);
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
