const bcrypt = require('bcrypt');
const { createInsertSchema, createSelectSchema } = require('drizzle-zod');
const { z } = require('zod');
const { users, usersStats, usersPokemons } = require('../db/schema');
const { ADMIN, USER, MODERATOR } = require('../enums/roles');

const usernameWeakValidation = z.string().min(3).max(15).regex(/^[a-zA-Z0-9_]*$/, { message: 'Only alphanumerical values and _' })
const arrayOfUserIdValidation = z.array(z.number().int());

// Accepts only username, email and password
const insertUserSchema = createInsertSchema(users, {
    email: z.string().email().min(5),
    username: z.string().regex(/^(?=.{3,15}$)(?![_])(?!.*[_]{2})[a-zA-Z0-9_]+(?<![_])$/),
    password: z.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{5,}$/)
        .transform((val) => bcrypt.hashSync(val, bcrypt.genSaltSync(10))),
}).pick({
    username: true,
    email: true,
    password: true,
});


const selectUserStatsSchema = createSelectSchema(usersStats).omit({ userId: true });

// For backend validation
const selectUserSchemaFull = createSelectSchema(users).omit({
    password: true,
}).extend({
    stats: selectUserStatsSchema.optional()
});

// For retriving data to user. Hides admin role so the username is not targeted, and hides password
const selectUserSchema = selectUserSchemaFull.omit({
    email: true,
}).extend({
    role: z.enum([ADMIN, MODERATOR, USER]).transform((role) => role === ADMIN ? USER : role),
});


const updateUserSchema = insertUserSchema.partial().refine(
    ({ username, email, password }) => username || email || password,
    { message: 'At least one field should be provided' }
);

//const selectUserPokemonsSchema = createSelectSchema(usersPokemons);


module.exports = {
    insertUserSchema,
    selectUserSchema,
    selectUserSchemaFull,
    updateUserSchema,
    usernameWeakValidation,
    arrayOfUserIdValidation
}
