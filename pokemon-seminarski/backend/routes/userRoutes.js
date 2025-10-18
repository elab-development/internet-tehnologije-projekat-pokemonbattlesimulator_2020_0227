const express = require('express');
const { getUser, registerUser, updateUser, loginUser, getUsersPokemons, getUsersMessages, deleteUser, requestUserPasswordReset, resetUserPassword, getUsers, evolvePokemon } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// /api/users

router.route('/').get(getUsers).post(registerUser)
router.route('/login').post(loginUser);
router.route('/reset-password').put(requestUserPasswordReset);
router.route('/reset-password/:token').patch(resetUserPassword);
router.route('/:param').get(getUser).patch(protect, updateUser).delete(protect, deleteUser);
router.route('/:param/messages').get(protect, getUsersMessages);
router.route('/:param/pokemons').get(protect, getUsersPokemons);
router.route('/:param/pokemons/:id').put(protect, evolvePokemon);

module.exports = router;