<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Move extends Model
{
    use HasFactory;

    public function moves(): BelongsToMany
    {
        return $this->belongsToMany(Pokemon::class, 'pokemons_moves')->withTimestamps();
    }
}

