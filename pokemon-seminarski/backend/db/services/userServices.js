const { eq, getTableColumns, asc, desc, count, inArray, ilike, or, and, sql } = require("drizzle-orm");
const db = require("../../config/db");
const { users, usersStats, usersPokemons, messages, passwordResetTokens, pokemons, moves, pokemonsMoves, types, pokemonsTypes, evolution } = require("../schema");
const { alias } = require("drizzle-orm/pg-core");
const { escapeLikePattern } = require("../../utils/sqlParser");

/**
 * @typedef {Object} CreateUserParams
 * @property {string} username 
 * @property {string} email 
 * @property {string} password 
 * @param {CreateUserParams} param0
 */
const createUser = async ({ username, email, password }) => {
    let threePokemons = await db.select().from(pokemons).orderBy(sql`RANDOM()`).limit(3);
    //if (threePokemons.length !== 3) return; zažmurimo na jedno oko

    let user = (await db.insert(users).values({ username: username, email: email, password: password }).returning())[0];

    (await db.insert(usersStats).values({ userId: user.id }));
    (await db.insert(usersPokemons).values(threePokemons.map(p => ({ pokemonId: p.id, userId: user.id }))));
    return user;
}


/**
 * @param {number} id
 */
const getUserById = async (id, populate = false) => {
    const baseQuery = {
        ...getTableColumns(users),
    }

    if (populate) {
        const { userId, ...stats } = getTableColumns(usersStats);
        baseQuery.stats = stats;
    }

    const result = await db
        .select(baseQuery)
        .from(users)
        .where(eq(users.id, id))
        .leftJoin(usersStats, eq(users.id, usersStats.userId));

    return result[0];
}

/**
 * @param {string} username 
 */
const getUserByUsername = async (username, populate = false) => {
    const baseQuery = {
        ...getTableColumns(users)
    }

    if (populate) {
        const { userId, ...stats } = getTableColumns(usersStats);
        baseQuery.stats = stats
    }

    const result = await db
        .select(baseQuery)
        .from(users)
        .where(eq(users.username, username))
        .leftJoin(usersStats, eq(users.id, usersStats.userId));

    return result[0];
}

const getUserByEmail = async (email, populate = false) => {
    const baseQuery = {
        ...getTableColumns(users)
    }

    if (populate) {
        baseQuery.stats = getTableColumns(usersStats);
    }

    const result = await db
        .select(baseQuery)
        .from(users)
        .where(eq(users.email, email))
        .leftJoin(usersStats, eq(users.id, usersStats.userId));

    return result[0];
}

/**
 * @param {{limit: number, offset: number, userIds: number[], queryUsername: string}} param0 
 * @returns 
 */
const getUsersDB = async ({ limit = 20, offset = 0, userIds = [], queryUsername = undefined }) => {

    let { password, email, ...baseQuery } = getTableColumns(users)

    const [{ value: totalCount }] = await db
        .select({ value: count() })
        .from(users)
        .where(and(userIds.length > 0 ? inArray(users.id, userIds) : undefined, ilike(users.username, `%${escapeLikePattern(queryUsername) ?? ""}%`)));

    const usersData = await db
        .select({ ...baseQuery })
        .from(users)
        .where(and(userIds.length > 0 ? inArray(users.id, userIds) : undefined, ilike(users.username, `%${escapeLikePattern(queryUsername) ?? ""}%`)))
        .orderBy(asc(users.id))
        .offset(offset)
        .limit(limit);

    return { totalCount, limit, offset, usersData };
}

/**
 * @param {{userId: number, username: string, email: string}} queryData 
 * @param {boolean} logicalConjunction
 */
const getUserDB = async ({ userId = undefined, username = undefined, email = undefined, password = undefined }, logicalConjunction = true) => {
    const listOfConditions = [
        userId ? eq(users.id, userId) : undefined,
        username ? eq(users.username, username) : undefined,
        email ? eq(users.email, email) : undefined,
        password ? eq(users.password, password) : undefined,
    ];
    const conditions = logicalConjunction ? and(...listOfConditions) : or(...listOfConditions)

    return (await db.select().from(users).where(conditions));
}

// Error check to not cause massive update
/** @param {import("../../utils/typedefs").UserTable} data */
const updateUserDB = async ({ id, ...data }) => {
    console.log(id == null, data);
    if (data == null || id == null) throw new Error('Data to be updated, userId or email are not provided.');
    await db.update(users).set({ ...data }).where(eq(users.id, id)).returning({ id: users.id });
}

/**
 * @typedef {{
 *      id: number, 
 *      xp: number, 
 *      createdAt: Date,
 *      evolvesToPokemonId: number | null,
 *      baseStats: {
 *          defenseBase: number, 
 *          healthPointsBase: number
 *      }, 
 *      type: {
 *          id: number, 
 *          name: string
 *      }[], 
 *      moves: {
 *          id: number, 
 *          name: string, 
 *          attackBase: number, 
 *          mana: number, 
 *          type: {
 *              id: number,
 *              name: string
 *          }
 *       }[]
 *  }} UsersPokemon Expanded pokemon that user owns
 * @param {number} userId 
 * @returns {Promise<UsersPokemon[]>}
 */
const getUsersPokemonsDB = async (userId) => {
    const mTypes = alias(types, 'move_types');
    const pTypes = alias(types, 'pokemon_types');

    const result = await db
        .select({
            id: usersPokemons.pokemonId,
            xp: usersPokemons.xp,
            baseStats: {
                defenseBase: pokemons.defenseBase,
                healthPointsBase: pokemons.healthPointsBase,
            },
            type: {
                id: pTypes.id,
                name: pTypes.name
            },
            move: {
                id: moves.id,
                name: moves.name,
                attackBase: moves.attackBase,
                mana: moves.manaCost,
                type: {
                    id: mTypes.id,
                    name: mTypes.name
                }
            },
            evolvesToPokemonId: evolution.evolvesToId,
            createdAt: usersPokemons.createdAt
        })
        .from(usersPokemons)
        .leftJoin(pokemons, eq(usersPokemons.pokemonId, pokemons.id))
        .leftJoin(pokemonsMoves, eq(usersPokemons.pokemonId, pokemonsMoves.pokemonId))
        .leftJoin(moves, eq(pokemonsMoves.moveId, moves.id))
        .leftJoin(mTypes, eq(moves.typeId, mTypes.id))
        .leftJoin(pokemonsTypes, eq(usersPokemons.pokemonId, pokemonsTypes.pokemonId))
        .leftJoin(pTypes, eq(pokemonsTypes.typeId, pTypes.id))
        .leftJoin(evolution, eq(evolution.pokemonId, usersPokemons.pokemonId))
        .where(eq(usersPokemons.userId, userId))

    const groupedResult = result.reduce((acc, row) => {
        if (!acc[row.id]) {
            acc[row.id] = {
                id: row.id,
                xp: row.xp,
                baseStats: row.baseStats,
                type: [],
                moves: [],
                evolvesToPokemonId: row.evolvesToPokemonId,
                createdAt: row.createdAt,
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

    const finalResult = Object.values(groupedResult);
    return finalResult;
}

/**
 * updates the user pokemon with the xp amount
 * @param {number} userId 
 * @param {number} pokemonId 
 * @param {number} xp amount of earned xp for that given pokemon
 * @returns 
 */
const updateUsersPokemonsDB = async (userId, pokemonId, xp) => {
    // SAFE CHECK
    if (userId == null || pokemonId == null || xp == null) {
        throw new Error('Must provide both userId, pokemonId and xp amount');
    }
    return (await db
        .update(usersPokemons)
        .set({ xp: Math.round(xp) }) // XP is of type integer, it needs to be rounded
        .where(and(eq(usersPokemons.pokemonId, pokemonId), eq(usersPokemons.userId, userId)))
    )
}

const deleteUsersPokemonDB = async (userId, pokemonId) => {
    //SAFE CHECK
    if (userId == null || pokemonId == null) {
        throw new Error('Must provide both userId and pokemonId');
    }
    return (await db.delete(usersPokemons).where(and(eq(usersPokemons.userId, userId), eq(usersPokemons.userId, userId))));
}

/**
 * Evolve users, provided by id `userId`, to pokemon `pokemonId` to pokemone `evolveToId 
 * @param {number} userId 
 * @param {number} pokemonId 
 * @param {number} evolveToId 
 */
const evolvePokemonDB = async (userId, pokemonId, evolveToId) => {
    if (userId == null || pokemonId == null) throw new Error('Required data not provided');

    await db
        .delete(usersPokemons)
        .where(and(eq(usersPokemons.pokemonId, pokemonId), eq(usersPokemons.userId, userId)));
    return (await db
        .insert(usersPokemons)
        .values({ pokemonId: evolveToId, userId: userId })
        .returning()
    )[0];
}

// Error check to not cause massive update
const deleteUserDB = async (userId) => {
    if (userId == null) throw new Error('Parameter userId is not defined');
    const [{ id }] = await db.delete(users).where(eq(users.id, userId)).returning({ id: users.id });
    return id;
}

/**
 * @param {number} userId
 * @param {{won: boolean, numOfDefeatedPokemon: number}} data
  */
const updateUsersStatsDB = async (userId, data) => {
    if (userId == null || data == null) {
        throw new Error('Must provide data and user id to update');
    }
    let playerStats = (await db.select().from(usersStats).where(eq(usersStats.userId, userId)).limit(1))[0];
    if (playerStats == null) {
        throw new Error("Couldn't find the user");
    }
    let newStats = {
        wins: playerStats.wins + (data.won ? 1 : 0),
        numOfDefeatedPokemon: playerStats.numOfDefeatedPokemon + data.numOfDefeatedPokemon,
        totalBattles: playerStats.totalBattles + 1
    }

    await db.update(usersStats).set({ ...newStats }).where(eq(usersStats.userId, userId));
}

/**
 * Get paginated and filtered messages for a user
 * @typedef {Object} FilterOptions
 * @property {number} userId - User ID
 * @property {number} offset - Offset of search (default: 0)
 * @property {number} limit - Limit per request (default: 10)
 * @property {number} chatsWith - Filter messages with a specific user
 * @property {boolean} receivedMessages - Include received messages (default: true)
 * @property {boolean} sentMessages - Include sent messages (default: true)
 * @property {boolean} orderByAsc - Order by ascending date (default: false)
 *
 * @param {FilterOptions} param0 
 */
const getUsersMessagesDB = async ({ userId, offset = 0, limit = 10, chatsWith = 0, receivedMessages = true, sentMessages = true, orderByAsc = false }) => {
    const conditions = or(
        receivedMessages ? eq(messages.receiverUserId, userId) : undefined,
        sentMessages ? eq(messages.senderUserId, userId) : undefined,
        chatsWith !== 0 ? or(eq(messages.senderUserId, chatsWith), eq(messages.receiverUserId, chatsWith)) : undefined
    );


    const [{ value: totalCount }] = await db
        .select({ value: count() })
        .from(messages)
        .where(conditions);

    const messagesData = await db
        .select()
        .from(messages)
        .where(conditions)
        .orderBy(orderByAsc ? asc(messages.createdAt) : desc(messages.createdAt))
        .offset(offset)
        .limit(limit)

    return { totalCount, offset, limit, messagesData };
}

/**
 * Inserts reset password token into database, on conflict updates.
 * @param {string} email 
 * @param {string} hashedToken 
 * @param {Date} expiresAt 
 * @returns 
 */
const insertResetPasswordToken = async (email, hashedToken, expiresAt) => {
    return (await db.insert(passwordResetTokens).values({
        email: email,
        token: hashedToken,
        expiresAt: expiresAt
    }).onConflictDoUpdate({
        target: passwordResetTokens.email,
        set: {
            token: hashedToken,
            expiresAt: expiresAt,
            createdAt: new Date()
        }
    }));
}

/**
 * @param {string} hashedToken 
 */
const getResetPasswordToken = async (hashedToken) => {
    return (await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, hashedToken)))[0];
}

const deleteResetPasswordToken = async (email) => {
    if (email == undefined) throw new Error('email needs to be provided');
    return (await db.delete(passwordResetTokens).where(eq(passwordResetTokens.email, email)));
}

const addPokemonDB = async (userId, pokemonId) => {
    return (await db.insert(usersPokemons).values({ pokemonId: pokemonId, userId: userId }).onConflictDoNothing());
}


module.exports = {
    createUser,
    getUserById,
    getUserByUsername,
    getUserByEmail,
    getUserDB,
    getUsersDB,
    updateUserDB,
    updateUsersStatsDB,
    getUsersMessagesDB,
    getUsersPokemonsDB,
    updateUsersPokemonsDB,
    deleteUsersPokemonDB,
    evolvePokemonDB,
    deleteUserDB,
    insertResetPasswordToken,
    getResetPasswordToken,
    deleteResetPasswordToken,
    addPokemonDB
}
