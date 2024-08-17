/**
 * @description     Gets a specific game by gameId
 * @route           GET /api/games/:id
 * @access          Public
 * 
 * @type {import('../utils/typedefs').DefaultHandler}
 */
const getGameById = (req, res) => {

}


// Pagination, Filtration {user: {userId, userId}, orderByAsc: boolean(def true)}
/**
 * @description     Gets an array of games
 * @route           GET /api/games
 * @access          Public
 * 
 * @type {import('../utils/typedefs').DefaultHandler}
 */
const getGames = (req, res) => {

}


module.exports = {
    getGameById,
    getGames
}