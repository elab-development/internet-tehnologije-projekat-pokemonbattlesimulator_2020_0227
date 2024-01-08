<?php

namespace App\Filters;

use Illuminate\Http\Request;

class ApiFilter
{
    /**
     * Dozvoljeni parametri u query-ju
     */
    protected $safeParams = [];

    /**
     * Query parametri koje treba prevesti iz camel case u snake case
     * @example ` protected $safeParams = [
     *      'name' => ['eq'],
     *      'postal_code => ['eq', 'lt', 'gt'],
     * ];
     * protected $columnMap = [
     *      'postalCode' => 'postal_code'
     * ];
     */
    protected $columnMap = [];

    protected $operatorMap = [];

    public function transform(Request $request)
    {
        $eloQuery = [];

        foreach ($this->safeParams as $param => $operators) {
            $query = $request->query($param);

            if (!isset($query)) {
                continue;
            }

            $column = $this->columnMap[$param] ?? $param;
            foreach ($operators as $operator) {
                if(isset($query[$operator])){
                    $eloQuery[] = [$column, $this->operatorMap[$operator], $query[$operator]];
                }
            }

        }

        return $eloQuery;
    }
}
