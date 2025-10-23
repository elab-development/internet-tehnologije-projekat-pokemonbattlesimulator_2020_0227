<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMoveRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('admin-authorize');
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $method = $this->method();

        if ($method == 'PUT') {
            return [
                'name' => ['required', 'string', 'max:255'],
                'power' =>['required', 'integer','between:1,100']
            ];
        } else {
            return [
                'name' => ['sometimes','required', 'string', 'max:255'],
                'power' =>['sometimes','required', 'integer','between:1,100']
            ];
        }
    }
}
