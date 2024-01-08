<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    /**
     * Schema::create('users', function (Blueprint $table) {
      *      $table->id();
       *     $table->string('name');
      *      $table->string('email')->unique();
      *      $table->timestamp('email_verified_at')->nullable();
      *      $table->string('password');
      *      $table->rememberToken();
      *      $table->timestamps();
      *  });
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'email' => $this->resource->email,
        ];
    }
}
