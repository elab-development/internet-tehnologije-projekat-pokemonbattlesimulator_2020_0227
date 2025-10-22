const { asc } = require("drizzle-orm");
const db = require("../../config/db");
const { moves } = require("../schema");

const getMovesDB = async () => {
    return (await db.query.moves.findMany({
        with: {
            type: true
        },
        orderBy: asc(moves.name)
    }));
}

const insertMoveDB = async ({ id, manaCost, name, attackBase, typeId }) => {
    return (await db.insert(moves).values({
        attackBase,
        manaCost,
        name,
        typeId,
        id
    }).returning())[0]
}

module.exports = {
    getMovesDB,
    insertMoveDB
}