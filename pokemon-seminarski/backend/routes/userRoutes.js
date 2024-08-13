const express = require('express');
const { authUser, registerUser, getUser } = require('../controllers/userController');

const router = express.Router();

// /api/users

router.route('/').post(registerUser);
router.route('/login').post(authUser);
router.route('/:param').get(getUser);

module.exports = router;