const { eq, getTableColumns } = require("drizzle-orm");
const db = require("../../config/db");
const { users, usersStats } = require("../schema");

/**
 * 
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 */
const createUser = async (username, email, password) => {
    return (await db.insert(users).values(checkedUser).returning())[0];
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
        .where(eq(users.id,id))
        .leftJoin(usersStats, eq(users.id, usersStats.userId));

    return result[0];
}

/**
 * @param {string} username 
 */
const getUserByUsername = async (username, populate = false) => {
    return (await db.select().from(users).where(eq(users.username, username)))[0];
}


module.exports = {
    createUser,
    getUserById,
    getUserByUsername
}
