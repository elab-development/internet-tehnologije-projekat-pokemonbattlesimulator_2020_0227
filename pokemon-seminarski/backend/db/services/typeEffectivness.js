const db = require("../../config/db")
const { typeEffectivness } = require("../schema")

const getMoveEffectivenesses = async () => {
    return await db.select().from(typeEffectivness);
}


module.exports = {
    getMoveEffectivenesses
}