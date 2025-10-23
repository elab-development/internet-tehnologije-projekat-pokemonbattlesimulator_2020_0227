<?php

namespace App\Policies;

use App\Models\User;

class RolePolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
        //
    }

    public function adminAuthorize(User $user)
    {
        return $user->role === 'admin';
    }

    public function userAuthorize(User $user)
    {
        return $user->role === 'user' || $user->role = 'admin';
    }
}
