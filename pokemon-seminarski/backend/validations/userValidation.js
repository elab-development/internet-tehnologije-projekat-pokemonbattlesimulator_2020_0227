const { createInsertSchema, createSelectSchema } = require('drizzle-zod');
const { z } = require('zod');
const { users, usersStats } = require('../db/schema');
const { ADMIN, USER, MODERATOR } = require('../enums/roles');

// Accepts only username, email and password
const insertUserSchema = createInsertSchema(users, {
    email: z.string().email().min(5),
    username: z.string().regex(/^(?=.{3,15}$)(?![_])(?![_]{2})[a-zA-Z0-9_]+(?<![_])$/),
    password: z.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{5,}$/),
}).pick({
    username: true,
    email: true,
    password: true,
});

const selectUserStatsSchema = createSelectSchema(usersStats);

// Hides admin role so the username is not targeted, and hides password
const selectUserSchema = createSelectSchema(users).omit({
    password: true, 
}).extend({
    role: z.enum([ADMIN, MODERATOR, USER]).transform((role) => role === ADMIN ? USER : role),
    stats: selectUserStatsSchema.optional()
});

module.exports = {
    insertUserSchema,
    selectUserSchema
}
