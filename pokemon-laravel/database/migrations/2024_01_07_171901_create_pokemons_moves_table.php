<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pokemons_moves', function (Blueprint $table) {
            $table->foreignId('pokemon_id')->constrained(table: 'pokemons')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('move_id')->constrained(table: 'moves')->onUpdate('cascade')->onDelete('cascade');
            $table->primary(['pokemon_id', 'move_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pokemons_moves');
    }
};
