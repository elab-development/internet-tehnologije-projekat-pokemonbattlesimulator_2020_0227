const express = require('express');
const { getUser, registerUser, updateUser, loginUser, getUsersPokemons, getUsersMessages, deleteUser, requestUserPasswordReset, resetUserPassword, getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// /api/users

router.route('/').get(getUsers).post(registerUser)
router.route('/login').post(loginUser);
router.route('/reset-password').post(requestUserPasswordReset);
router.route('/reset-password/:token').post(resetUserPassword);
router.route('/:param').get(getUser).patch(protect, updateUser).delete(protect, deleteUser);;
router.route('/:param/messages').get(protect, getUsersMessages);
router.route('/:param/pokemons').get(protect, getUsersPokemons);


module.exports = router;