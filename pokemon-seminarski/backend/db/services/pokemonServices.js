const { count, eq } = require('drizzle-orm');
const db = require('../../config/db');
const { pokemons, types, pokemonsTypes, pokemonsMoves, moves, evolution } = require('../schema');
const { alias } = require('drizzle-orm/pg-core');


/**@param {number} id */
const getPokemonByIdDB = async (id) => {
    const pTypes = alias(types, 'pokemon_types');
    const mTypes = alias(types, 'move_types');
    const pokemonData = await db
        .select({
            id: pokemons.id,
            baseStats: {
                defenseBase: pokemons.defenseBase,
                healthPointsBase: pokemons.healthPointsBase,
            },
            type: {
                id: pTypes.id,
                name: pTypes.name,
            },
            move: {
                id: moves.id,
                name: moves.name,
                mana: moves.manaCost,
                attackBase: moves.attackBase,
                type: {
                    id: mTypes.id,
                    name: mTypes.name
                }
            },
            evolvesToPokemonId: evolution.evolvesToId
        })
        .from(pokemons)
        .leftJoin(pokemonsTypes, eq(pokemons.id, pokemonsTypes.pokemonId))
        .leftJoin(pTypes, eq(pokemonsTypes.typeId, pTypes.id))
        .leftJoin(pokemonsMoves, eq(pokemons.id, pokemonsMoves.pokemonId))
        .leftJoin(moves, eq(pokemonsMoves.moveId, moves.id))
        .leftJoin(mTypes, eq(moves.typeId, mTypes.id))
        .leftJoin(evolution, eq(evolution.pokemonId, pokemons.pokemonId))
        .where(eq(pokemons.id, id))

    const accumulatedPokemon = pokemonData.reduce((acc, row) => {
        if (row.move?.id != null && acc[row.id].moves.some((val) => val.id === row.move.id)) {
            acc.moves.push(row.move);
        }
        if (row.type?.id != null && acc[row.id].type.some((val) => val.id === row.type.id)) {
            acc.type.push(row.type);
        }
        return acc;
    }, {
        id: pokemonData[0].id,
        baseStats: pokemonData[0].baseStats,
        evolvesToPokemonId: pokemonData[0].evolvesToPokemonId,
        moves: [],
        type: []
    });

    return accumulatedPokemon;
}

const getPokemonsDB = async ({ offset = 0, limit = 10 }) => {
    const [{ value: totalCount }] = await db.select({ value: count() }).from(pokemons);
    const pTypes = alias(types, 'pokemon_types');
    const mTypes = alias(types, 'move_types');
    const pokemonsData = await db
        .select({
            id: pokemons.id,
            baseStats: {
                defenseBase: pokemons.defenseBase,
                healthPointsBase: pokemons.healthPointsBase,
            },
            type: {
                id: pTypes.id,
                name: pTypes.name,
            },
            move: {
                id: moves.id,
                name: moves.name,
                mana: moves.manaCost,
                attackBase: moves.attackBase,
                type: {
                    id: mTypes.id,
                    name: mTypes.name
                }
            },
            evolvesToPokemonId: evolution.evolvesToId
        })
        .from(pokemons)
        .leftJoin(pokemonsTypes, eq(pokemons.id, pokemonsTypes.pokemonId))
        .leftJoin(pTypes, eq(pokemonsTypes.typeId, pTypes.id))
        .leftJoin(pokemonsMoves, eq(pokemons.id, pokemonsMoves.pokemonId))
        .leftJoin(moves, eq(pokemonsMoves.moveId, moves.id))
        .leftJoin(mTypes, eq(moves.typeId, mTypes.id))
        .leftJoin(evolution, eq(evolution.pokemonId, pokemons.pokemonId))
        .offset(offset)
        .limit(limit);
    const accumulatedPokemons = pokemonsData.reduce((acc, row) => {
        if (!acc[row.id]) {
            acc[row.id] = {
                id: row.id,
                xp: row.xp,
                baseStats: row.baseStats,
                type: [],
                moves: [],
                evolvesToPokemonId: row.evolvesToPokemonId
            }
        }
        if (row.move?.id != null && acc[row.id].moves.some((val) => val.id === row.move.id)) {
            acc[row.id].moves.push(row.move);
        }
        if (row.type?.id != null && acc[row.id].type.some((val) => val.id === row.type.id)) {
            acc[row.id].type.push(row.type);
        }

        return acc;
    }, {});
    /**@type {{id: number, baseStats: {def: number, hp: number}, type: {id: number, name: string}[]}[]} */
    const finalResult = Object.values(accumulatedPokemons);

    return { totalCount, offset, limit, pokemonsData: finalResult }
}

/**@param {import('../../utils/typedefs').PokemonTable} */
const insertPokemonDB = async ({ id }) => {
    return (await db.insert(pokemons).values({ id }).returning())[0];
}

/**@param {import('../../utils/typedefs').PokemonTable[]} pokemons */
const insertBulkPokemonDB = async (pokemons) => {
    return (await db.insert(pokemons).values(pokemons).returning({ count: count() }));
}

/**@param {number} id */
const deletePokemonDB = async (id) => {
    return (await db.delete(pokemons).where(eq(pokemons.id, id)).returning())[0];
}

/**
 * @param {number} idToUpdate
 * @param {import('../../utils/typedefs').PokemonTable} param0
 */
const updatePokemonDB = async (idToUpdate, { id }) => {
    return (await db.update(pokemons).set({ id: id }).where(eq(pokemons.id, idToUpdate)).returning())[0];
}


module.exports = {
    getPokemonByIdDB,
    getPokemonsDB,
    insertPokemonDB,
    insertBulkPokemonDB,
    updatePokemonDB,
    deletePokemonDB
}   