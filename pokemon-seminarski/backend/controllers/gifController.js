const throttle = require('../utils/throttle');
const axios = require('axios');
/** 
 * Get's gifs with provided query string
 * @description     Gets gifs
 * @route           GET /api/gifs
 * @access          Private
 * 
 * @type {import('express').RequestHandler<{}, any, any, qs.ParsedQs, Record<string, any>, import('express').NextFunction>}
 */
const getGifs = async (req, res, next) => {
    const { q: query = '' } = req.query;
    const cacheKey = `/search?q=${query.trim()}`;

    // Store the cacheKey in res.locals for the setCache middleware
    res.locals.cacheKey = cacheKey;

    try {
        // Throttle the API request
        const response = await throttle.enqueue(() => query.trim() === '' ?
            axios.get(`${process.env.TENOR_BASE_URL}/featured`, {
                params: {
                    key: process.env.TENOR_API_KEY
                }
            })
            : axios.get(`${process.env.TENOR_BASE_URL}/search`, {
                params: {
                    q: query,
                    key: process.env.TENOR_API_KEY
                }
            })
        );

        const data = {
            locale: response.data.locale,
            data: response.data.results.map((val) => ({
                id: val.id,
                title: val.title,
                mediaFormats: {
                    nanogif: val.media_formats.nanogif.url,
                    tinygif: val.media_formats.tinygif.url
                }
            }))
        }

        res.locals.data = data;
        res.status(200).json(data);
        next();
    } catch (error) {
        console.error('Tenor API error:', error);
        res.status(500).json({ error: 'Failed to fetch gifs from Tenor' });
    }
}


module.exports = {
    getGifs,
}