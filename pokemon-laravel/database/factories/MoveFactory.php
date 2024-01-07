<?php

namespace Database\Factories;

use App\Models\Move;
use App\Models\Pokemon;
use Closure;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Move>
 */
class MoveFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->unique()->word();
        $power = $this->faker->numberBetween(10, 100);

        return [
            'name' => $name,
            'power' => $power,
        ];
    }

}
