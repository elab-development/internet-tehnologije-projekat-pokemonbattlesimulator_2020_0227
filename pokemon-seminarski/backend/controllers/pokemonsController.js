const { insertPokemonDB, insertBulkPokemonDB, getPokemonByIdDB, getPokemonsDB, deletePokemonDB, updatePokemonDB } = require("../db/services/pokemonServices");
const { ADMIN } = require("../enums/roles");
const getClientURL = require("../utils/getClientURL");
const { parseIntegerStrict } = require("../utils/parsesForPrimitives");
const { ResponseError } = require("../utils/typedefs");
const { selectPokemonSchema, insertPokemonSchema, updatePokemonSchema } = require("../validations/pokemonValidation");
const { z } = require('zod');


/**
 * @description     Inserts new pokemons in to the database
 * @route           POST /api/pokemons
 * @access          Private
 * 
 * @type {import("../utils/typedefs").DefaultHandler}
 */
const insertPokemons = async (req, res) => {
    if (req.user.role !== ADMIN) {
        return res.status(401).json(new ResponseError('Unauthorized'));
    }

    let { pokemons } = req.body;
    let { id, defenseBase, healthPointsBase } = req.body;

    if (pokemons == null) {
        pokemons = [{ id, defenseBase, healthPointsBase }];
    } else if (!Array.isArray(pokemons)) {
        pokemons = [pokemons];
    } //else pokemons exist and is an Array

    let validatedArray;
    try {
        validatedArray = z.array(insertPokemonSchema).nonempty().parse(pokemons);
    } catch (error) {
        return res.status(400).json(new ResponseError('Bad Request', error, 'body', 'pokemons'));
    }

    try {
        if (validatedArray.length === 1) {
            let pokemon = await insertPokemonDB(validatedArray[0]);
            return res.status(201).json({ message: "Success!!", pokemon: { ...pokemon } });
        } else {
            let result = await insertBulkPokemonDB(validatedArray);
            return res.status(201).json({ rowsInserted: result });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ResponseError(error.message));
    }
}


/**
 * @description     Retrives a pokemon of specific id
 * @route           GET /api/pokemons/:id
 * @access          Public
 * 
 * @type {import('express').RequestHandler<{id: string}, any, any, qs.ParsedQs, Record<string, any>}
 */
const getPokemonById = async (req, res) => {
    const { id } = req.params;
    let validatedPokemonId;
    try {
        validatedPokemonId = z.number().int().parse(parseIntegerStrict(id));
    } catch (error) {
        return res.status(400).json(new ResponseError('Bad Request', { id: 'Expected integer' }, 'params'))
    }

    try {
        const result = await getPokemonByIdDB(validatedPokemonId);
        return res.status(200).json({ ...result })
    } catch (error) {
        return res.status(500).json(new ResponseError(error.message))
    }
}


// Pagination
/**
 * @description     Returns pokemon
 * @route           GET /api/pokemons
 * @access          Public
 * 
 * @type {import("../utils/typedefs").DefaultHandler}
 */
const getPokemons = async (req, res) => {
    let errors = []
    if (req.query.offset != null && !isStringInteger(req.query.offset))
        errors.push('offset$Expected number');
    if (req.query.limit != null && !isStringInteger(req.query.limit, { negative: false }))
        errors.push('limit$Expected positive number');

    if (errors.length !== 0) {
        return res.status(400).json(new ResponseError('Bad Request', errors, 'query'));
    }


    let x;
    let offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;
    let limit = req.query.limit && (x = parseInt(req.query.limit, 10)) === 0 ? x : undefined;


    try {
        let obj = { offset, limit }
        Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key])
        const result = await getPokemonsDB({ ...obj });


        return res.status(200).json({
            totalCount: result.totalCount,
            next: result.offset + result.limit >= result.totalCount ? null : `${getClientURL()}/api/pokemons?offset=${result.offset + result.limit < 0 ? 0 : result.offset}&limit=${result.offset + 2 * result.limit > result.totalresult ? result.totalCount - result.limit : (result.limit <= 0 ? Math.min(20, result.totalCount) : result.limit)}`,
            previous: result.offset === 0 ? null : `${getClientURL()}/api/pokemons?offset=${(result.offset - result.limit < 0) ? 0 : (result.offset - result.limit > result.totalCount ? result.totalCount - result.limit : result.offset - result.limit)}&limit=${result.offset - result.limit < 0 ? result.offset : result.limit}`,
            data: result.pokemonsData
        });
    } catch (error) {
        return res.status(500).json(new ResponseError(error.message));
    }
}


/**
 * @description     Returns pokemon
 * @route           GET /api/pokemons/:id
 * @access          Private
 * 
 * @type {import('express').RequestHandler<{id: string}, any, any, qs.ParsedQs, Record<string, any>}
 */
const deletePokemon = async (req, res) => {
    if (req.user.role !== ADMIN) {
        return res.status(401).json(new ResponseError('Unauthorized'));
    }

    let { id } = req.params;
    let validatedPokemonId;
    try {
        validatedPokemonId = z.number().int().parse(parseIntegerStrict(id));
    } catch (error) {
        return res.status(400).json(new ResponseError('Bad Request', { id: 'Expected integer' }, 'params'))
    }

    try {
        await deletePokemonDB(validatedPokemonId);
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json(new ResponseError(error.message));
    }
}


/**
 * @description     Updates a pokemon
 * @route           GET /api/pokemons/:id
 * @access          Private
 * 
 * @type {import('express').RequestHandler<{id: string}, any, any, qs.ParsedQs, Record<string, any>}
 */
const updatePokemon = async (req, res) => {
    if (req.user.role !== ADMIN) {
        return res.status(401).json(new ResponseError('Unauthorized'));
    }

    let reqId = req.params.id;
    let { id, defenseBase, healthPointsBase } = req.body;
    let validatedPokemonId;
    try {
        validatedPokemonId = z.number().int().parse(parseIntegerStrict(reqId));
    } catch (error) {
        return res.status(400).json(new ResponseError('Bad Request', { id: 'Expected integer' }, 'params'))
    }

    try {
        validatedUpdate = updatePokemonSchema.parse({ id, defenseBase, healthPointsBase });
    } catch (error) {
        return res.status(400).json(new ResponseError('Bad Request', error, 'body'))
    }

    try {
        await updatePokemonDB(validatedPokemonId);
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json(new ResponseError(error.message));
    }
}



module.exports = {
    insertPokemons,
    getPokemonById,
    getPokemons,
    updatePokemon,
    deletePokemon
}