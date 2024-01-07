<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Pokemon extends Model
{
    use HasFactory;
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(Pokemon::class, 'users_pokemons')->withTimestamps();
    }
    public function moves(): BelongsToMany
    {
        return $this->belongsToMany(Pokemon::class, 'pokemons_move')->withTimestamps();
    }
}
