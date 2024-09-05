const cache = require('./cache');

/** @type {(model: string) => import('express').RequestHandler<{}, any, any, qs.ParsedQs, Record<string, any>, import('express').NextFunction>} */
const getFromCache = (model) => (req, res, next) => {
    const cacheKey = req.originalUrl; // Use the request URL as a unique key
    const cachedData = cache.get(cacheKey, model);

    if (cachedData) {
        return res.status(200).json(cachedData); // Send the cached data if available
    }

    res.locals.cacheKey = cacheKey; // Store the key in res.locals for later use
    next(); // Proceed to the controller
};

/** @type {(model: string) => import('express').RequestHandler<{}, any, any, qs.ParsedQs, Record<string, any>, import('express').NextFunction>} */
const setCache = (model) => (req, res, next) => {
    const { cacheKey, data } = res.locals;

    if (cacheKey && data) {
        cache.set(cacheKey, data, model);
    }

    next(); // Proceed to the next middleware or finish the response
};

module.exports = {
    getFromCache,
    setCache,
};