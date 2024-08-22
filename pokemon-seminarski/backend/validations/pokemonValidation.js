const { createInsertSchema, createSelectSchema } = require("drizzle-zod");
const { pokemons } = require("../db/schema");

const insertPokemonSchema = createInsertSchema(pokemons);
const selectPokemonSchema = createSelectSchema(pokemons);
const updatePokemonSchema = insertPokemonSchema.optional();


module.exports = {
    insertPokemonSchema,
    selectPokemonSchema,
    updatePokemonSchema
}