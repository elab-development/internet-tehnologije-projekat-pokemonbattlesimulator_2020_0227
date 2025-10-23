<?php

namespace App\Filters;

use Illuminate\Http\Request;

class MoveFilter extends ApiFilter
{
    protected $safeParams = [
        'name' => ['eq'],
        'power' => ['eq', 'lt', 'lte', 'gt', 'gte', 'ne'],
    ];

    protected $columnMap = [];

    protected $operatorMap = [
        'eq' => '=',
        'lt' => '<',
        'lte' => '<=',
        'gt' => '>',
        'gte' => '>=',
        'ne' => '!='
    ];
}
