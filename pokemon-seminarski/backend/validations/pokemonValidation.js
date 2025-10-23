const { createInsertSchema, createSelectSchema } = require("drizzle-zod");
const { pokemons } = require("../db/schema");

const insertPokemonSchema = createInsertSchema(pokemons);
const selectPokemonSchema = createSelectSchema(pokemons);
const updatePokemonSchema = insertPokemonSchema.optional().refine(
    ({ id, defenseBase, healthPointsBase }) => id != null || defenseBase != null || healthPointsBase != null,
    { message: 'At least one field should be provided' }
);


module.exports = {
    insertPokemonSchema,
    selectPokemonSchema,
    updatePokemonSchema
}