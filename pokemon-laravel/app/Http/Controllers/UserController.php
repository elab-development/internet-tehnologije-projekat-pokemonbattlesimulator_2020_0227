<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Filters\UserFilter;
use App\Http\Requests\AddPokemonsToUserRequest;
use App\Http\Requests\DeleteUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\Pokemon;
use App\Models\User;

class UserController extends Controller
{
    public const PAGINATION_AMOUNT = 5;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('user-authorize');

        $filter = new UserFilter();
        $filterItems = $filter->transform($request); //?column[operator]=value
        $includePokemons = $request->query('includePokemons');

        $users = User::where($filterItems);

        if ($includePokemons) {
            $users = $users->with('pokemons');
        }

        return new UserCollection(
            $users->paginate(UserController::PAGINATION_AMOUNT)->appends($request->query())
        );
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $this->authorize('user-authorize');

        $user = User::find($id);
        if (is_null($user)) {
            return response()->json([
                'message' => 'Data not found'
            ], 404);
        }

        return new UserResource($user);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {

        $user->update($request->all());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DeleteUserRequest $request, string $id)
    {
        User::destroy($id);
    }

    public function add_pokemons_to_user(AddPokemonsToUserRequest $request, User $user)
    {
        $pokemonIds = $request->input('pokemon_ids');

        $user->pokemons()->attach($pokemonIds);
    }

    public function add_random_pokemon_to_user(User $user)
    {
        $this->authorize('user-authorize');
        if(auth()->user()->id !== $user->id){
            abort(403);
        }

        $randomPokemon = Pokemon::getRandomPokemon();

        $user->pokemons()->attach($randomPokemon);
    }
}
