<?php

namespace Database\Factories;

use App\Models\Move;
use App\Models\Pokemon;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Pokemon>
 */
class PokemonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->unique()->name();

        return [
            'name' => $name,
        ];
    }

    /**
     * I guess ill never know
     */
    /*public function configure(): static
    {
        return $this->afterCreating(function (Pokemon $pokemon){
            $move = Move::factory()->create();
            $pokemon->moves()->attach($move->id);
        });
    }*/
}
