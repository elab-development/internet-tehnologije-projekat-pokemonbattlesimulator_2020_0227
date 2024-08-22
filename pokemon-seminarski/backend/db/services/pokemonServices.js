const { count, eq } = require('drizzle-orm');
const db = require('../../config/db');
const { pokemons } = require('../schema');


/**@param {number} id */
const getPokemonByIdDB = async (id) => {
    return (await db.select().from(pokemons).where(eq(pokemons.id, id)))[0];
}

const getPokemonsDB = async ({ offset = 0, limit = 10 }) => {
    const [{ value: totalCount }] = await db.select({ value: count() }).from(pokemons);
    const pokemonsData = await db.select().from(pokemons).offset(offset).limit(limit);

    return { totalCount, offset, limit, pokemonsData }
}

/**@param {import('../../utils/typedefs').PokemonTable} */
const insertPokemonDB = async ({ id }) => {
    return (await db.insert(pokemons).values({ id }).returning())[0];
}

/**@param {import('../../utils/typedefs').PokemonTable[]} pokemons */
const insertBulkPokemonDB = async (pokemons) => {
    return (await db.insert(pokemons).values(pokemons).returning({count: count()}));
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