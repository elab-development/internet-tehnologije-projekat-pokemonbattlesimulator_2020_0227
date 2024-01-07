<?php

namespace Database\Seeders;

use App\Models\Move;
use App\Models\Pokemon;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PopulateManyToManySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $pokemons = Pokemon::all();
        $moves = Move::all();

        foreach ($users as $user){
            //Daje korisniku 0 do 5 pokemona
            $numberOfPokemons = rand(0, 5);
            $randomPokemons = $pokemons->random($numberOfPokemons);

            $user->pokemons()->attach($randomPokemons->pluck('id')->toArray());
        }

        foreach($pokemons as $pokemon){
            //Daje pokemonu 1 do 5 pokreta
            $numberOfMoves = rand(1, 5);
            $randomMoves = $moves->random($numberOfMoves);
            
            $pokemon->moves()->attach($randomMoves->pluck('id')->toArray());
        }
    }
}
