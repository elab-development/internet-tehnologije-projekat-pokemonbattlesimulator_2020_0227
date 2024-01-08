<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MoveController;
use App\Http\Controllers\PokemonController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

/*Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});*/

Route::group([
    'prefix' => 'v1',
    'namespace' => 'App\Http\Controllers',
], function () {
    Route::get('/pokemons', [PokemonController::class, 'index']);
    Route::get('/pokemons/{id}', [PokemonController::class, 'show']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::group([
        'middleware' => 'auth:sanctum'
    ], function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('pokemons', PokemonController::class)->except('index', 'show');
        Route::apiResource('move', MoveController::class)->except('index', 'show');

        Route::post('/pokemons/bulk', [PokemonController::class, 'bulkStore'])->name('pokemon.bulkStore');
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::post('/users/{user}/add-pokemons', [AuthController::class, 'add_pokemons_to_user'])->name('users.add-pokmeons');
        Route::post('/users/{user}/get-random-pokemon', [AuthController::class, 'add_random_pokemon_to_user'])->name('users.get-random-pokmeon');
        Route::post('/pokemons/{pokemon}/add-moves', [AuthController::class, 'add_moves_to_pokemon'])->name('pokemons.add-moves');        
    });
});
