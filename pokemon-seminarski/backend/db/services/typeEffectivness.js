const db = require("../../config/db")
const { typeEffectivness } = require("../schema")

const getMoveEffectivenesses = async () => {
    return (await db.select().from(typeEffectivness)).map(te => ({...te, effectivness: parseFloat(te.effectivness)}));
}


module.exports = {
    getMoveEffectivenesses
}