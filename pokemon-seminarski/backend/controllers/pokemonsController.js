const { insertPokemonDB, insertBulkPokemonDB, getPokemonByIdDB, getPokemonsDB, deletePokemonDB } = require("../db/services/pokemonServices");
const { ADMIN } = require("../enums/roles");
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
    let { id } = req.body;

    if (pokemons == null) {
        pokemons = [{ id }];
    } else if (!Array.isArray(pokemons)) {
        pokemons = [pokemons];
    } //else pokemons exist and is Array

    let validatedArray;
    try {
        validatedArray = z.array(insertPokemonSchema).nonempty().parse(pokemons);
    } catch (error) {
        return res.status(400).json(new ResponseError('Bad Request', error, 'body', 'pokemons'));
    }

    try {
        if (validatedArray.length === 1) {
            return res.status(201).json(await insertPokemonDB(validatedArray[0]));
        } else {
            let result = await insertBulkPokemonDB(validatedArray);
            return res.status(201).json({ rowsInserted: result });
        }
    } catch (error) {
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
        return res.status(200).json()
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
        const result = await getPokemonsDB(Object.keys({
            offset,
            limit,
        }).forEach(key => obj[key] === undefined && delete obj[key]));

        return res.status(200).json({
            totalCount: result.totalCount,
            next: result.offset + result.limit >= result.totalCount ? null : `${process.env.HOST ?? `http://localhost:${process.env.PORT ?? 5000}`}/api/pokemons?offset=${result.offset + result.limit < 0 ? 0 : result.offset}&limit=${result.offset + 2 * result.limit > result.totalresult ? result.totalCount - result.limit : result.limit}`,
            previous: offset === 0 ? null : `${process.env.HOST ?? `http://localhost:${process.env.PORT ?? 5000}`}/api/pokemons?offset=${(result.offset - result.limit < 0) ? 0 : (result.offset - result.limit > result.totalCount ? result.totalCount - result.limit : result.offset - result.limit)}&limit=${result.offset - result.limit < 0 ? result.offset : result.limit}`,
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



module.exports = {
    insertPokemons,
    getPokemonById,
    getPokemons,
    updatePokemon,
    deletePokemon
}