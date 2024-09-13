const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getFromCache, setCache } = require('../middleware/cacheMiddleware');
const { getGifs } = require('../controllers/gifController');


const router = express.Router();
const model = 'gifs';

// api/gifs

router.route('/search').get(getFromCache(model), getGifs, setCache(model));

module.exports = router