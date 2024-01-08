<?php

namespace App\Filters;

use Illuminate\Http\Request;

class PokemonFilter extends ApiFilter
{
    protected $safeParams = [
        'name' => ['eq'],
        'email' => ['eq'],
    ];

    protected $columnMap = [];

    protected $operatorMap = [
        'eq' => '=',
        'lt' => '<',
        'lte' => '<=',
        'gt' => '>',
        'gte' => '>=',
    ];

}
