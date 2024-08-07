const { relations } = require('drizzle-orm');
const { serial, text, timestamp, integer, pgTable, primaryKey, numeric, varchar } = require('drizzle-orm/pg-core');

const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: text('username').notNull().unique(),
    email: text('email').notNull(),
    role: text('role', { enum: ["admin", "moderator", "player"] }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

const pokemons = pgTable('pokemons', {
    id: integer('id').notNull().primaryKey()
});

const moves = pgTable('moves', {
    id: serial('id').primaryKey()
})

const usersStats = pgTable('users_stats', {
    userId: integer('user_id').notNull().references(() => users.id),
    trophies: integer('trophies').notNull().default(0),
    wins: integer('wins').notNull().default(0),
    totalBattles: integer('total_battles').notNull().default(0),
    numOfDefeatedPokemon: integer('num_of_defeated_pokemons').notNull().default(0),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId] })
}));

/*export const pokemonsMoves = pgTable(() => {

})*/

const usersPokemons = pgTable('users_pokemons', {
    pokemonId: integer('pokemon_id').notNull().references(() => pokemons.id),
    userId: integer('user_id').notNull().references(() => users.id),
    evolutionPercentage: numeric('evolution_percentage', { precision: 4, scale: 1 }).notNull().default("0"),
    createdAt: timestamp('created_at').notNull().defaultNow()
}, (t) => ({
    pk: primaryKey({ columns: [t.pokemonId, t.userId] })
})
);

const messages = pgTable('messages', {
    senderUserId: integer('sender_user_id').notNull().references(() => users.id),
    reciverUserId: integer('reciver_user_id').notNull().references(() => users.id),
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
        fields: [messages.reciverUserId],
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
    usersMessages,
    usersToMessagesRelations,
    usersToPokemonsRelations
}