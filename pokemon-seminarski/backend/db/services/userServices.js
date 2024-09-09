const { eq, getTableColumns, asc, desc, count, inArray, ilike } = require("drizzle-orm");
const db = require("../../config/db");
const { users, usersStats, usersPokemons, messages, passwordResetTokens, pokemons, moves, pokemonsMoves, types, pokemonsTypes } = require("../schema");
const { alias } = require("drizzle-orm/pg-core");

/**
 * @typedef {Object} CreateUserParams
 * @property {string} username 
 * @property {string} email 
 * @property {string} password 
 * @param {CreateUserParams} param0
 */
const createUser = async ({ username, email, password }) => {
    return (await db.insert(users).values({ username: username, email: email, password: password }).returning())[0];
}


/**
 * @param {number} id
 */
const getUserById = async (id, populate = false) => {
    const baseQuery = {
        ...getTableColumns(users),
    }

    if (populate) {
        baseQuery.stats = usersStats;
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
        baseQuery.stats = usersStats;
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
const getUsersDB = async ({ limit = 1, offset = 10, userIds = [], queryUsername = undefined }) => {

    let { password, email, ...baseQuery } = getTableColumns(users)

    const [{ value: totalCount }] = await db
        .select({ value: count() })
        .from(users);

    const usersData = await db
        .select(...baseQuery)
        .from(users)
        .where(users.length > 0 ? inArray(users.id, userIds) : undefined, ilike(users.username, `%${queryUsername}%`))
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
    if (!data && id == null) throw new Error('Data to be updated, userId or email are not provided.');
    await db.update(users).set({ ...data }).where(eq(users.id, id)).returning({ id: users.id });
}

const getUsersPokemonsDB = async (userId) => {
    const mTypes = alias(types);
    const pTypes = alias(types);

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
            createdAt: usersPokemons.createdAt
        })
        .from(usersPokemons)
        .leftJoin(pokemons, eq(usersPokemons.pokemonId, pokemons.id))
        .leftJoin(pokemonsMoves, eq(usersPokemons.pokemonId, pokemonsMoves.pokemonId))
        .leftJoin(moves, eq(pokemonsMoves.moveId, moves.id))
        .leftJoin(mTypes, eq(moves.typeId, mTypes.id))
        .leftJoin(pokemonsTypes, eq(usersPokemons.pokemonId, pokemonsTypes.pokemonId))
        .leftJoin(pTypes, eq(pokemonsTypes.typeId, pTypes.id))
        .where(eq(usersPokemons.userId, userId))

    const groupedResult = result.reduce((acc, row) => {
        if (!acc[row.id]) {
            acc[row.id] = {
                id: row.id,
                xp: row.xp,
                baseStats: row.baseStats,
                type: [],
                moves: [],
                createdAt: row.createdAt,
            }
        }
        if (row.move?.id != null && acc[row.id].moves.some((val) => val.id === row.move.id)) {
            acc[row.id].moves.push(row.move);
        }
        if (row.type?.id != null && acc[row.id].type.some((val) => val.id === row.type.id)) {
            acc[row.id].type.push(row.type);
        }

        return acc;
    }, {});

    const finalResult = Object.values(groupedResult);
}

// Error check to not cause massive update
const deleteUserDB = async (userId) => {
    if (userId == null) throw new Error('Parameter userId is not defined');
    const [{ id }] = await db.delete(users).where(eq(users.id, userId)).returning({ id: users.id });
    return id;
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
    const conditions = and(
        receivedMessages ? eq(messages.receiverUserId, userId) : undefined,
        sentMessages ? eq(messages.senderUserId, userId) : undefined,
        chatsWith ? or(eq(messages.senderUserId, chatsWith), eq(messages.receiverUserId, chatsWith)) : undefined
    );

    const [{ value: totalCount }] = await db
        .select({ value: count() })
        .from(messages)
        .where(conditions);

    const messagesData = await db
        .select()
        .from(messages)
        .where(...conditions)
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
const getResetPasswordToken = async (token) => {
    return (await db.select().from(passwordResetTokens).where(eq(passwordResetTokens, hashedToken)))[0];
}

module.exports = {
    createUser,
    getUserById,
    getUserByUsername,
    getUserByEmail,
    getUserDB,
    getUsersDB,
    updateUserDB,
    getUsersMessagesDB,
    getUsersPokemonsDB,
    deleteUserDB,
    insertResetPasswordToken,
    getResetPasswordToken
}
