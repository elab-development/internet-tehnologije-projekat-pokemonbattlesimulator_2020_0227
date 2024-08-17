const express = require('express');
const { getUser, registerUser, updateUser, loginUser, getUsersPokemons, getUsersMessages, deleteUser, requestUserPasswordReset, resetUserPassword, getUsers } = require('../controllers/userController');

const router = express.Router();

// /api/users

router.route('/').get(getUsers).post(registerUser)
router.route('/login').post(loginUser);
router.route('/reset-password').post(requestUserPasswordReset);
router.route('/reset-password/:token').post(resetUserPassword);
router.route('/:param').get(getUser).patch(updateUser).delete(deleteUser);;
router.route('/:param/messages').get(getUsersMessages);
router.route('/:param/pokemons').get(getUsersPokemons);


module.exports = router;