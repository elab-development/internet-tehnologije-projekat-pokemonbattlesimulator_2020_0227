const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMessages } = require('../controllers/messagesController');

const router = express.Router();

router.route('/').get(protect, getMessages);