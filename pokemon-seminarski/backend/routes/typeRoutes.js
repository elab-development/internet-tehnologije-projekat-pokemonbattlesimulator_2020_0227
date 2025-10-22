const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getTypes } = require('../controllers/typeController');

const router = express.Router();

router.route('/').get(protect, getTypes);

module.exports = router;