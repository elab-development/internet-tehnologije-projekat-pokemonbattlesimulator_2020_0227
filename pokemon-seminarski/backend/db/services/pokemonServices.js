const { count, eq, and } = require('drizzle-orm');
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
        if (row.move?.id != null && acc.moves.every((val) => val.id !== row.move.id)) {
            acc.moves.push(row.move);
        }
        if (row.type?.id != null && acc.type.every((val) => val.id !== row.type.id)) {
            acc.type.push(row.type);
        }
        return acc;
    }, {
        id: pokemonData[0].id,
        baseStats: pokemonData[0].baseStats,
        evolvesToPokemonId: pokemonData[0].evolvesToPokemonId,
        type: [],
        moves: []
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

    const accumulatedPokemons = pokemonsData.reduce((acc, row) => {
        if (!acc[row.id]) {
            acc[row.id] = {
                id: row.id,
                baseStats: row.baseStats,
                type: [],
                moves: [],
                evolvesToPokemonId: row.evolvesToPokemonId
            }
        }
        if (row.move?.id != null && acc[row.id].moves.every((val) => val.id !== row.move.id)) {
            acc[row.id].moves.push(row.move);
        }
        if (row.type?.id != null && acc[row.id].type.every((val) => val.id !== row.type.id)) {
            acc[row.id].type.push(row.type);
        }

        return acc;
    }, {});
    /**@type {{id: number, baseStats: {def: number, hp: number}, type: {id: number, name: string}[]}[]} */
    const result = Object.values(accumulatedPokemons);
    const finalResult = result.slice(
        Math.max(0, offset - 1),
        Math.max(0, offset - 1 + limit)
    )

    return { totalCount, offset, limit, pokemonsData: finalResult }
}

/**@param {import('../../utils/typedefs').PokemonTable & {moves: number[], types: number[], evolvesTo: number}} */
const insertPokemonDB = async ({ id, defenseBase, healthPointsBase, moves: moveIds, types: typeIds, evolvesTo }) => {
    await db.insert(pokemons).values({ id, defenseBase, healthPointsBase });
    if (moveIds && moveIds.length === 3) {
        await db.delete(pokemonsMoves).where(eq(pokemonsMoves.pokemonId, id))
        await Promise.all(moveIds.map(async moveId => {
            await db.insert(pokemonsMoves).values({ pokemonId: id, moveId: moveId })
        }))
    }

    await db.delete(pokemonsTypes).where(eq(pokemonsTypes.pokemonId, id));
    await Promise.all(typeIds.map(async typeId => {
        await db.insert(pokemonsTypes).values({ pokemonId: id, typeId: typeId })
    }))

    const evo = await db.query.evolution.findFirst({
        where: and(eq(evolution.pokemonId, id))
    });

    if (evolvesTo != null) {
        const evolvesToPokemon = await db.query.pokemons.findFirst({
            where: eq(pokemons.id, evolvesTo)
        })
        if (evolvesToPokemon) {
            if (evo) {
                await db.update(evolution).set({ evolvesToId: evolvesTo }).where(eq(evolution.id, evo.id))
            } else {
                await db.insert(evolution).values({ pokemonId: id, evolvesToId: evolvesTo, })
            }
        }
    } else if (evo) {
        await db.delete(evolution).where(eq(evolution.pokemonId, id));
    }

    return await getPokemonByIdDB(id);
}

/**@param {import('../../utils/typedefs').PokemonTable[]} pokemons */
const insertBulkPokemonDB = async (pokemonsData) => {
    return (await db.insert(pokemons).values(pokemonsData).returning()).length;
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