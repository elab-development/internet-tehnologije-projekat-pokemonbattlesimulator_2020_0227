<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Pokemon extends Model
{
    use HasFactory;

    protected $table = 'pokemons';
    protected $fillable = [
        'name'
    ];

    public static function getRandomPokemon()
    {
        return self::inRandomOrder()->first();
    }
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'users_pokemons')->withTimestamps();
    }
    public function moves(): BelongsToMany
    {
        return $this->belongsToMany(Move::class, 'pokemons_moves')->withTimestamps();
    }
}
