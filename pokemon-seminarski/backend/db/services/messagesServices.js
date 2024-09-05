const { and, SQL, inArray, ilike, desc } = require("drizzle-orm");
const db = require("../../config/db");
const { messages, users } = require("../schema");
const { alias } = require("drizzle-orm/pg-core");

/**
 * 
 * @param {{offset: number, limit: number, user1: number | Array<number>, user2: number | Array<number>, direction: import("../../utils/typedefs").direction, q: string }} param0 
 * @returns 
 */
const getMessagesDB = async ({ offset = 0, limit = 10, user1 = undefined, user2 = undefined, direction = 'both', q = undefined }) => {
    if (user1 != null && !Array.isArray(user1)) {
        user1 = [user1];
    }
    if (user2 != null && !Array.isArray(user2)) {
        user2 = [user2];
    }

    /**@type {SQL[]} */
    let checks = [];
    switch (direction) {
        case "sent":
            if (user1 != null && user1.length > 0) {
                checks.push(inArray(messages.senderUserId, user1));
            }
            if (user2 != null && user2.length > 0) {
                checks.push(inArray(messages.receiverUserId, user2));
            }
            break;
        case "received":
            if (user1 != null && user1.length > 0) {
                checks.push(inArray(messages.receiverUserId, user1));
            }
            if (user2 != null && user2.length > 0) {
                checks.push(inArray(messages.senderUserId, user2));
            }
            break;
        case "both":
            if (user1 != null && user2 != null && user1.length > 0 && user2.length > 0) {
                checks.push(or(
                    and(
                        inArray(messages.senderUserId, user1), inArray(messages.receiverUserId, user2)
                    ),
                    and(
                        inArray(messages.senderUserId, user2), inArray(messages.receiverUserId, user1)
                    )
                ));
            } else if (user1 != null && user2 == null && user1.length > 0) { // user1 <=> any -> proveravamo length
                checks.push(or(
                    inArray(messages.senderUserId, user1), inArray(messages.receiverUserId, user2)
                ));
            } else if (user1 != null && user2 == null && user1.length > 0) { // user1 <=> any -> proveravamo length
                checks.push(or(
                    inArray(messages.senderUserId, user2), inArray(messages.receiverUserId, user1)
                ));
            } else {
                throw new Error('Invalid argument, array.length must be greater then 0');
            }
            break;
        default:
            throw new Error('Invalid argument');
    }

    if (q) {
        checks.push(ilike(messages.message, `%${q}%`));
    }

    const [{ value: totalCount }] = await db.select({ value: count() }).from(messages).where(...checks);
    const senderAlias = alias(users, 'sender');
    const receiverAlias = alias(users, 'receiver');
    const messagesData = await db
        .select({
            sender: {
                id: senderAlias.id,
                username: senderAlias.username
            },
            receiver: {
                id: receiverAlias.id,
                username: receiverAlias.username
            },
            message: messages.message,
            createdAt: messages.createdAt
        })
        .from(messages)
        .leftJoin(senderAlias, eq(senderAlias.id, messages.senderUserId))
        .leftJoin(receiverAlias, eq(receiverAlias.id, messages.receiverUserId))
        .where(...checks)
        .offset(offset)
        .limit(limit)
        .orderBy(desc(messages.createdAt));

    return { totalCount, offset, limit, messagesData }
}

const insertMessageDB = async ({ message, receiverUserId, senderUserId }) => {
    return (await db.insert(messages).values({ message: message, receiverUserId: receiverUserId, senderUserId: senderUserId }).returning())[0];
}

module.exports = {
    getMessagesDB,
    insertMessageDB
}