const express = require('express');
const { getGames, getGameById } = require('../controllers/gamesController');

const router = express.Router();

router.route('/').get(getGames);
router.route('/:id').get(getGameById);

module.exports = router;