const jwt = require('jsonwebtoken');
const { getUserById } = require('../db/services/userServices');
const { selectUserSchemaFull } = require('../validations/userValidation');

/**
 * @type  {import('../utils/typedefs').DefaultHandler}
 */
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = selectUserSchemaFull.parse(await getUserById(decoded.id));
            
            next();
        } catch (err) {
            return res.status(401).json({ message: `Not authorized - ${err.message}` });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized - no token provided' });
    }
}

module.exports = { protect }