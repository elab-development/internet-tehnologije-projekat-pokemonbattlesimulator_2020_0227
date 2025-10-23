const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMoves, insertMove } = require('../controllers/movesController');

const router = express.Router();

router.route('/').get(protect, getMoves).post(protect, insertMove);

module.exports = router;