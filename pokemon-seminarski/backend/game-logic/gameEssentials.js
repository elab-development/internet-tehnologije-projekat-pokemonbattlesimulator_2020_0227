const { getMoveEffectivenesses } = require("../db/services/typeEffectivness")



module.exports = async () => {
    return {
        movesEffectivenesses: await getMoveEffectivenesses()
    }
}