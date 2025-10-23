const express = require('express');
const { getUser, registerUser, updateUser, loginUser, getUsersPokemons, getUsersMessages, deleteUser, requestUserPasswordReset, resetUserPassword, getUsers, evolvePokemon, addPokemon, muteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { guard } = require('../middleware/guardMiddleware');
const { ADMIN, MODERATOR } = require('../enums/roles');

const router = express.Router();

// /api/users

router.route('/').get(getUsers).post(registerUser)
router.route('/login').post(loginUser);
router.route('/request-password-reset').post(requestUserPasswordReset);
router.route('/reset-password/:token').patch(resetUserPassword);
router.route('/:param').get(getUser).patch(protect, updateUser).delete(protect, deleteUser);
router.route('/:param/mute').post(protect, guard([ADMIN, MODERATOR]), muteUser)
router.route('/:param/messages').get(protect, getUsersMessages);
router.route('/:param/pokemons').get(protect, getUsersPokemons);
router.route('/:param/pokemons/:id').post(protect, guard([ADMIN]), addPokemon).put(protect, evolvePokemon);

module.exports = router;