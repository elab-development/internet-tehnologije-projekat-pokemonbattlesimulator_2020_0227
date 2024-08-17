const { eq, getTableColumns, asc, desc, count } = require("drizzle-orm");
const db = require("../../config/db");
const { users, usersStats, usersPokemons, messages, passwordResetTokens } = require("../schema");
const { isNullOrUndefined, parseIntegerStrict } = require("../../utils/parsesForPrimitives");

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
        baseQuery.stats = usersStats;
    }

    const result = await db
        .select(baseQuery)
        .from(users)
        .where(eq(users.username, username))
        .leftJoin(usersStats, eq(users.id, usersStats.userId));

    return result[0];
}

const getUserByEmail = async (email) => {
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
 * @param {{limit: number, offset: number}} param0 
 * @returns 
 */
const getUsersDB = async ({ limit = 1, offset = 10 }) => {

    let { password, email, ...baseQuery } = getTableColumns(users)

    const [{ value: totalCount }] = await db
        .select({ value: count() })
        .from(users);

    const usersData = await db
        .select(...baseQuery)
        .from(users)
        .orderBy(asc(users.id))
        .offset(offset)
        .limit(limit);

    return { totalCount, limit, offset, usersData };
}

/**
 * @param {{userId: number, username: string, email: string}} param0 
 */
const getUserDB = async ({ userId = undefined, username = undefined, email = undefined }) => {
    const conditions = or(
        userId ? eq(users.id, userId) : undefined,
        username ? eq(users.username, username) : undefined,
        userId ? eq(users.id, userId) : undefined,
    );

    return (await db.select().from(users).where(conditions));
}

// Error check to not cause massive update
/** @param {import("../../utils/typedefs").UserTable} data */
const updateUserDB = async ({ id, ...data }) => {
    if (!data && isNullOrUndefined(id)) throw new Error('Data to be updated, userId or email are not provided.');
    await db.update(users).set({ ...data }).where(eq(users.id, id)).returning({ id: users.id });
}

const getUsersPokemonsDB = async (userId) => {
    return await db.select().from(usersPokemons).where(eq(usersPokemons.userId, userId));
}

// Error check to not cause massive update
const deleteUserDB = async (userId) => {
    if (isNullOrUndefined(userId)) throw new Error('Parameter userId is not defined');
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
        receivedMessages ? eq(messages.reciverUserId, userId) : undefined,
        sentMessages ? eq(messages.senderUserId, userId) : undefined,
        chatsWith ? or(eq(messages.senderUserId, chatsWith), eq(messages.reciverUserId, chatsWith)) : undefined
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
