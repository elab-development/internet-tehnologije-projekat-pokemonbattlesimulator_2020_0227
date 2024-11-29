const { validateToken } = require('../utils/validateToken.js');
const { ResponseError } = require('../utils/typedefs');

/**
 * @type  {import('../utils/typedefs').DefaultHandler}
 */
const protect = async (req, res, next) => {
    try {
        let user = await validateToken(req.headers.authorization);
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json(new ResponseError('Not authorized - ' + error.message))
    }
}

module.exports = { protect }