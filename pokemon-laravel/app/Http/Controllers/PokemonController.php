<?php

namespace App\Http\Controllers;

use App\Http\Resources\PokemonCollection;
use App\Http\Resources\PokemonResource;
use App\Models\Pokemon;
use App\Filters\PokemonFilter;
use App\Http\Requests\AddMovesToPokemonRequest;
use App\Http\Requests\BulkStorePokemonRequest;
use App\Http\Requests\DeletePokemonRequest;
use App\Http\Requests\StorePokemonRequest;
use App\Http\Requests\UpdatePokemonRequest;
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

        if ($includeMoves) {
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
    public function store(StorePokemonRequest $request)
    {
        return new PokemonResource(Pokemon::create($request->all()));
    }

    /**
     * Insert a bulk of pokemons in storage
     */
    public function bulkStore(BulkStorePokemonRequest $request)
    {
        Pokemon::insert($request->all());
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $pokemon = Pokemon::find($id);
        if (is_null($pokemon)) {
            return response()->json([
                'message' => 'Data not found'
            ], 404);
        }

        if ($request->query('includeMoves')) {
            $pokemon->load('moves');
        }
        return new PokemonResource($pokemon);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePokemonRequest $request, Pokemon $pokemon)
    {
        $pokemon->update($request->all());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DeletePokemonRequest $request, string $id)
    {
        Pokemon::destroy($id);
    }

    public function add_moves_to_pokemon(AddMovesToPokemonRequest $request, Pokemon $pokemon)
    {
        $moveIds = $request->input('move_ids');

        $pokemon->moves()->attach($moveIds);
    }
}
