const jwt = require('jsonwebtoken');

/**
 * @param {number} id 
 * @param {string} expiresIn default '30d'
 * @returns {string}
 */
const generateToken = (data, expiresIn = '30d') => {
    return jwt.sign({ ...data }, process.env.JWT_SECRET, {expiresIn: expiresIn});
}
module.exports = generateToken