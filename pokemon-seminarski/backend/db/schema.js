const { relations } = require('drizzle-orm');
const { serial, text, timestamp, integer, pgTable, primaryKey, numeric, varchar, boolean, } = require('drizzle-orm/pg-core');
const { ADMIN, MODERATOR, USER } = require('../enums/roles');

/*/*             USER RELATED            **/

const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 128 }).notNull().unique(),
    email: varchar('email', { length: 256 }).notNull().unique(),
    password: varchar('password', { length: 72 }).notNull(),
    role: varchar('role', { enum: [ADMIN, MODERATOR, USER], length: 64 }).notNull().default(USER),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
});

const usersStats = pgTable('users_stats', {
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    trophies: integer('trophies').notNull().default(0),
    wins: integer('wins').notNull().default(0),
    totalBattles: integer('total_battles').notNull().default(0),
    numOfDefeatedPokemon: integer('num_of_defeated_pokemons').notNull().default(0),
    //private: boolean('private').notNull().default(false)
}, (t) => ({
    pk: primaryKey({ columns: [t.userId] })
}));

const messages = pgTable('messages', {
    senderUserId: integer('sender_user_id').notNull().references(() => users.id),
    receiverUserId: integer('reciver_user_id').notNull().references(() => users.id),
    message: varchar('message', { length: 512 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

const passwordResetTokens = pgTable('password_reset_tokens', {
    email: varchar('email', { length: 256 }).primaryKey().references(() => users.email, { onDelete: 'cascade' }),
    token: varchar('token', { length: 64 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    expiresAt: timestamp('expires')
});

/*/*           POKEMON RELATED               **/
const pokemons = pgTable('pokemons', {
    id: integer('id').notNull().primaryKey(),
    defenseBase: integer('defense_base').notNull(),
    healthPointsBase: integer('hp_base').notNull()
});


const evolution = pgTable('evolution', {
    id: serial('id').primaryKey(),
    pokemonId: integer('pokemon_id').notNull().references(() => pokemons.id, { onDelete: 'cascade' }),
    evolvesToId: integer('evolves_to_id').notNull().references(() => pokemons.id, { onDelete: 'cascade' }),
    expirienceRequired: integer('expirience_required').notNull(),
})

const moves = pgTable('moves', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 128 }).notNull(),
    manaCost: integer('mana_cost').notNull(),
    attackBase: integer('attack_base').notNull(),
    typeId: integer('type_id').notNull().references(() => types.id, { onDelete: 'cascade' })
});


const pokemonsMoves = pgTable('pokemons_moves', {
    moveId: integer('move_id').notNull(),
    pokemonId: integer('pokemon_id').notNull()
}, (t) => ({
    pk: primaryKey({ columns: [t.moveId, t.pokemonId] })
}));

const types = pgTable('types', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 32 }).notNull()
});

const typeEffectivness = pgTable('type_effectiveness', {
    attackerTypeId: integer('id').notNull(),
    defenderTypeId: integer('id').notNull(),
    effectivness: numeric('effectivness', { precision: 2, scale: 1 }).notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.attackerTypeId, t.defenderTypeId] })
}));

const pokemonsTypes = pgTable('pokemon_type', {
    pokemonId: integer('pokemon_id').notNull(),
    typeId: integer('type_id').notNull()
});

const usersPokemons = pgTable('users_pokemons', {
    pokemonId: integer('pokemon_id').notNull().references(() => pokemons.id),
    userId: integer('user_id').notNull().references(() => users.id),
    xp: integer('xp').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow()
}, (t) => ({
    pk: primaryKey({ columns: [t.pokemonId, t.userId] })
}));

/*/*            GAME RELATED             */
const games = pgTable('games', {
    id: serial('id').primaryKey(),
    user1Id: integer('user1_id').references(() => users.id, { onDelete: 'set null' }),
    user2Id: integer('user2_id').references(() => users.id, { onDelete: 'set null' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.user1Id, t.user2Id] })
}));


/*/*            Relations            */
const gameRelations = relations(games, ({ one }) => ({
    user1: one(users, { fields: games.user1Id, references: [users.id] }),
    user2: one(users, { fields: games.user2Id, references: [users.id] })
}));

const userRelations = relations(users, ({ one, many }) => ({
    gamesWon: many(games),
    gamesLost: many(games),
    pokemons: many(usersPokemons),
    stats: one(usersStats),
    sentMessages: many(messages),
    recivedMessages: many(messages),
    passwordResetToken: one(passwordResetTokens),
}));

const pokemonRelations = relations(users, ({ one, many }) => ({
    users: many(usersPokemons),
    evolvesTo: one(evolution),
    evolvedFrom: one(evolution),
    moves: many(pokemonsMoves),
    type: many(pokemonsTypes)
}));

const movesRelations = relations(moves, ({ one, many }) => ({
    pokemons: many(pokemonsMoves),
    types: one(types, {
        fields: [moves.type],
        references: [types.id]
    })
}));

const statsRelation = relations(usersStats, ({ one }) => ({
    user: one(users, {
        fields: [usersStats.userId],
        references: [users.id]
    })
}));
const typesRelations = relations(types, ({ one, many }) => ({
    moves: many(moves),
    attackerEffectivnes: many(typeEffectivness),
    defenderEffectivnes: many(typeEffectivness),
    pokemons: many(pokemonsTypes)
}));

const typeEffectivnessRelation = relations(typeEffectivness, ({ one }) => ({
    attackerType: one(types, {
        fields: [typeEffectivness.attackerTypeId],
        references: [types.id]
    }),
    defenderType: one(types, {
        fields: [typeEffectivness.defenderTypeId],
        references: [types.id]
    })
}));

const pokemonsTypesRelation = relations(pokemonsTypes, ({ one }) => ({
    pokemon: one(pokemons, {
        fields: [pokemonsTypes.pokemonId],
        references: [pokemons.id]
    }),
    type: one(types, {
        fields: [pokemonsTypes.typeId],
        references: [types.id]
    })
}));

const passwordResetTokenRelation = relations(passwordResetTokens, ({ one }) => ({
    user: one(users, {
        fields: [passwordResetTokens.email],
        references: [users.email]
    })
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
}));

const pokemonToPokemonEvolutionRelation = relations(evolution, ({ one }) => ({
    pokemon: one(pokemons, {
        fields: [evolution.pokemonId],
        references: [pokemons.id]
    }),
    evolvesTo: one(pokemons, {
        fields: [evolution.evolvesToId],
        references: [pokemons.id]
    })
}));

const pokemonsToMovesRelation = relations(pokemonsMoves, ({ one }) => ({
    pokemon: one(pokemons, {
        fields: [pokemonsMoves.pokemonId],
        references: [pokemons.id]
    }),
    type: one(moves, {
        fields: [pokemonsMoves.moveId],
        references: [moves.id]
    }),
}));


module.exports = {
    users,
    usersStats,
    usersPokemons,
    pokemons,
    pokemonsTypes,
    pokemonsMoves,
    evolution,
    moves,
    messages,
    games,
    types,
    typeEffectivness,
    passwordResetTokens,


    gameRelations,
    userRelations,
    pokemonRelations,
    usersToMessagesRelations,
    usersToPokemonsRelations,
    statsRelation,
    pokemonsToMovesRelation,
    movesRelations,
    typesRelations,
    typeEffectivnessRelation,
    pokemonsTypesRelation,
    passwordResetTokenRelation,
    pokemonToPokemonEvolutionRelation,
}