const { asc } = require("drizzle-orm");
const db = require("../../config/db");
const { types } = require("../schema");

const getTypesDB = async () => {
    return (await db.query.types.findMany({
        orderBy: asc(types.id)
    }));
}

module.exports = {
    getTypesDB,
}