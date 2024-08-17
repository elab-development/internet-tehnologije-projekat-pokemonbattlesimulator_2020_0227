/**
 * @description     Inserts new pokemon to database
 * @route           POST /api/pokemons
 * @access          Admin
 * 
 * @type {import("../utils/typedefs").DefaultHandler}
 */
const insertPokemons = (req, res) => {

}

/**
 * @description     Retrives a pokemon of specific id
 * @route           GET /api/pokemons/:id
 * @access          Public
 * 
 * @type {import("../utils/typedefs").DefaultHandler}
 */
const getPokemonById = (req, res) => {

}


// Pagination
/**
 * @description     Returns pokemon
 * @route           GET /api/pokemons
 * @access          Public
 * 
 * @type {import("../utils/typedefs").DefaultHandler}
 */
const getPokemons = (req, res) => {

}



module.exports = {
    insertPokemons,
    getPokemonById,
    getPokemons
}