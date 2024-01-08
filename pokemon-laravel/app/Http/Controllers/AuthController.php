<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginUserRequest;
use App\Http\Requests\RegisterUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(RegisterUserRequest $request)
    {
        $user = User::create($request->all());

        $token = $user->createToken('user-token')->plainTextToken;
        return response()->json([
            'data' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    public function login(LoginUserRequest $request)
    {
        if (!Auth::attempt($request->only('email', 'password')))
            return response()->json(['message' => 'Unauthorized'], 401);

        $user = User::where('email', $request['email'])->firstOrFail();

        $tokenName = $user->role == 'admin' ? 'admin-token' : 'user-token';
        $token = $user->createToken($tokenName)->plainTextToken;

        if($tokenName == 'admin'){
            $user->tokens()->where('name', 'user-token')->delete();
        }

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    public function logout() {
        auth()->user()->currentAccessToken()->delete();
        return [
            'message'=>'You have successfully logged out and teh token was successfully deleted'
        ];
    }
}