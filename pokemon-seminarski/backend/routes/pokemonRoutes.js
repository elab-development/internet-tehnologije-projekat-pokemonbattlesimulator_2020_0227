const express = require('express');
const { getPokemons, insertPokemons, deletePokemon, updatePokemon, getPokemonById } = require('../controllers/pokemonsController');
const { protect } = require('../middleware/authMiddleware');


const router = express.Router();

// api/pokemons

router.route('/').get(getPokemons).post(protect, insertPokemons)
router.route('/:id').get(getPokemonById).delete(protect, deletePokemon).patch(protect, updatePokemon);

module.exports = router;