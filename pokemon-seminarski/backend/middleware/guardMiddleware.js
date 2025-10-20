const { validateToken } = require('../utils/validateToken.js');
const { ResponseError } = require('../utils/typedefs');

/**
 * @param {string[]} roles
 * @returns  {import('../utils/typedefs').DefaultHandler}
 */
const guard = (roles) => async (req, res, next) => {
    const user = req.user;
    if (!user) {
        throw new Error("This middleware cannot be called if user is not authorized");
    }

    try {
        console.log(req.user);
        if (roles.some(r => r === req.user.role)) {
            next();
        } else {
            throw new Error("Insufficient permissions");
        }
    } catch (error) {
        return res.status(403).json(new ResponseError('Not Authorized - ' + error.message))
    }
}

module.exports = { guard }