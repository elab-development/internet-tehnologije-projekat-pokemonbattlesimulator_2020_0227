const { SQL, desc, count, asc, inArray, and, eq, or } = require('drizzle-orm');
const db = require('../../config/db');
const { games } = require('../schema');


/**
 * Gets all games with given query conditions
 * @param {{limit: number, offset: number, gameId: number[], user = number[] | number, winner: number[] | number, loser: number[] | number, orderByAsc: boolean}} 
 * @example 
 * // To get all games between two users
 * data = getGamesDB({winner = [1,2], loser = [1,2]})
 * 
 * // To get all games of one user
 * data = getGamesDB({user = [1]})
 * */
const getGamesDB = async ({ limit = 10, offset = 0, gameId = undefined, user = undefined, winner = undefined, loser = undefined, /*orderByAsc = false*/ }) => {
    if (typeof gameId === 'number') {
        gameId = [gameId];
    }

    if (typeof user === 'number') {
        gameId = [gameId];
    }

    if (typeof winner === 'number') {
        winner = [winner];
    }

    if (typeof loser === 'number') {
        loser = [loser];
    }
    /**@type {Array<SQL>} */
    let checks = [];

    if (user != null && winner != null && loser != null) {
        throw new Error('Unintended use of service, user and winner cant be provided in the same time');
    }
    if (user != null) {
        checks.push(or(inArray(games.user1Id, user), inArray(games.user2Id, user)));
    } else {
        if (winner != null && winner.length > 0) {
            checks.push(inArray(games.winner, winner));
        }
        if (loser != null && loser.length > 0) {
            checks.push(inArray(games.loser, loser));
        }
    }
    const [{ value: totalCount }] = await db.select({ value: count() }).from(games).where(...checks);
    const gamesData = await db
        .select()
        .from(games)
        .where(...checks)
        .offset(offset)
        .limit(limit)
        //.orderBy();

    return { totalCount, offset, limit, gamesData }

}

module.exports = {
    getGamesDB,
}