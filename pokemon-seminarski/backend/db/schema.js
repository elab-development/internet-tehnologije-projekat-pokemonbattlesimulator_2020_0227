const { relations } = require('drizzle-orm');
const { serial, text, timestamp, integer, pgTable, primaryKey, numeric, varchar, boolean, } = require('drizzle-orm/pg-core');
const { ADMIN, MODERATOR, USER } = require('../enums/roles');

const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 128 }).notNull().unique(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    password: varchar('password', { length: 72 }).notNull(),
    role: varchar('role', { enum: [ADMIN, MODERATOR, USER], length: 64 }).notNull().default(USER),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

const pokemons = pgTable('pokemons', {
    id: integer('id').notNull().primaryKey()
});

const moves = pgTable('moves', {
    id: serial('id').primaryKey(),
    name: varchar('name', {length: 128}),
    manaCost: integer('mana_cost').notNull(),
});

const types = pgTable('types', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 32 })
});

const typeEffectivness = pgTable('type_effectiveness', {
    attackerTypeId: integer('id').notNull(),
    defenderTypeId: integer('id').notNull(),
    effectivness: numeric('effectivness', { precision: 2, scale: 1})
}, (t) => ({
    pk: primaryKey({columns: [t.attackerTypeId, t.defenderTypeId]})
}));

const evolution = pgTable('evolution', {
    id: serial('id'.primaryKey),
    pokemonId: integer('pokemon_id').notNull().references(() => pokemons.id),
    evolvesToId: integer('evolves_to_id').notNull().references(() => pokemons.id),
    levelRequired: integer('level_required').notNull(),
    coinsRequired: integer('coins_required').notNull()
})


const usersStats = pgTable('users_stats', {
    userId: integer('user_id').notNull().references(() => users.id),
    trophies: integer('trophies').notNull().default(0),
    wins: integer('wins').notNull().default(0),
    totalBattles: integer('total_battles').notNull().default(0),
    numOfDefeatedPokemon: integer('num_of_defeated_pokemons').notNull().default(0),
    private: boolean('private').notNull().default(false)
}, (t) => ({
    pk: primaryKey({ columns: [t.userId] })
}));

/*export const pokemonsMoves = pgTable(() => {

})*/

const usersPokemons = pgTable('users_pokemons', {
    pokemonId: integer('pokemon_id').notNull().references(() => pokemons.id),
    userId: integer('user_id').notNull().references(() => users.id),
    level: integer('level').notNull(),
    xp: integer('xp').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow()
}, (t) => ({
    pk: primaryKey({ columns: [t.pokemonId, t.userId] })
})
);

const messages = pgTable('messages', {
    senderUserId: integer('sender_user_id').notNull().references(() => users.id),
    receiverUserId: integer('reciver_user_id').notNull().references(() => users.id),
    message: varchar('message', { length: 512 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

const games = pgTable('games', {
    id: serial('id').primaryKey(),
    user1Id: integer('user1_id').notNull().references(() => users.id),
    user2Id: integer('user2_id').notNull().references(() => users.id),
    /* ako saznam ikad kako da ubacim array of references biće super */
}, (t) => ({
    pk: primaryKey({ columns: [t.user1Id, t.user2Id] })
}));

const passwordResetTokens = pgTable('password_reset_tokens', {
    email: varchar('email', { length: 256 }).primaryKey(),
    token: varchar('token', { length: 64 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    expiresAt: timestamp('expires')
})



// Relations
const gameRelations = relations(games, ({ one }) => ({
    user1: one(users, { fields: games.user1Id, references: [users.id] }),
    user2: one(users, { fields: games.user2Id, references: [users.id] })
}));

const userRelations = relations(users, ({ one, many }) => ({
    games: many(games),
    pokemons: many(usersPokemons),
    stats: one(usersStats),
    sentMessages: many(messages),
    recivedMessages: many(messages)
}));

const pokemonRelations = relations(users, ({ many }) => ({
    users: many(usersPokemons),
}));

const usersToPokemonsRelations = relations(usersPokemons, ({ one }) => ({
    user: one(users, {
        fields: [usersPokemons.userId],
        references: [users.id]
    }),
    pokemon: one(users, {
        fields: [usersPokemons.pokemonId],
        references: [pokemons.id]
    })
}));

const usersToMessagesRelations = relations(messages, ({ one }) => ({
    sender: one(users, {
        fields: [messages.senderUserId],
        references: [users.id]
    }),
    reciver: one(users, {
        fields: [messages.receiverUserId],
        references: [users.id]
    })
}))

module.exports = {
    users,
    pokemons,
    moves,
    usersStats,
    usersPokemons,
    messages,
    games,
    gameRelations,
    userRelations,
    pokemonRelations,
    usersToMessagesRelations,
    usersToPokemonsRelations,
    passwordResetTokens
}