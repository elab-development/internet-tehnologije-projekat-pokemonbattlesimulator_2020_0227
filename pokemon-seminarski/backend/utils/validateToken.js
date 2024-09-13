const { getUserById } = require("../db/services/userServices");
const { selectUserSchemaFull } = require("../validations/userValidation");
const jwt = require('jsonwebtoken');

/**
 * @param {string} token 
 * @throws {Error} when token is not valid
 */
const validateToken = async (token) => {
    let val;
    if (token && token.startsWith('Bearer')) {

        val = token.split(' ')[1];
        const decoded = jwt.verify(val, process.env.JWT_SECRET);

        let user = await getUserById(decoded.id);

        if (!user) { // NEKAKO JE IZBRISAO NALOG I POKUŠAO DA SE ULOGUJE
            throw new Error('just why');
        }
        return selectUserSchemaFull.parse(user);
    }
    throw new Error('no token provided');
}

module.exports = {
    validateToken
};