const { ZodError, ZodIssueCode } = require('zod');
const { ResponseError } = require('../utils/typedefs');
const { isStringInteger, dynamicParseStringToPrimitives } = require('../utils/parsesForPrimitives');
const { getGamesDB } = require('../db/services/gameServices');

/**
 * @description     Gets a specific game by gameId
 * @route           GET /api/games/:id
 * @access          Public
 * 
 * @type {import('express').RequestHandler<{id: string}, any, any, qs.ParsedQs, Record<string, any>}
 */
const getGameById = (req, res) => {
    let zerrors = new ZodError([]);

    // Filtration
    if (req.params.id != null && !isStringInteger(req.params.id)) {
        zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ["gameId"], message: 'Expected integer' });
    }

    if(!zerrors.isEmpty){
        return res.status(400).json(new ResponseError('Bad Request', zerrors, 'query'));
    }
}


// Pagination {limit, offset}, Filtration {gameId: number[], user: number[], loser: number[], winner[], orderByAsc: boolean(def false)}
/**
 * @description     Gets an array of games
 * @route           GET /api/games
 * @access          Public
 * 
 * @type {import('../utils/typedefs').DefaultHandler}
 */
const getGames = async (req, res) => {

    if (req.query.user != null && (req.query.winner != null || req.query.loser !== null)) {
        return res.status(400).json(new ResponseError('Bad Request - either provide user field or winner and loser field or none'));
    }

    let zerrors = new ZodError([]);

    // Pagination
    if (req.query.offset != null && !isStringInteger(req.query.offset))
        zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ["offset"], message: 'Expected integer' });
    if (req.query.limit != null && !isStringInteger(req.query.limit, { negative: false }))
        zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ["limitfset"], message: 'Expected positive integer' });

    // Filtration
    if (req.query.gameId != null && !isStringInteger(req.query.gameId)) {
        if (!Array.isArray(req.query.gameId)) {
            zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ["gameId"], message: 'Expected integer or array of integers' });
        } else {
            zerrors.addIssues(arrayOfUserIdValidation.safeParse(
                req.query.gameId.forEach((val) => dynamicParseStringToPrimitives(val))
            ).error?.issues.map((val) => {
                val.path.unshift('gameId');
                return val;
            }));
        }
    }
    if (req.query.user != null && !isStringInteger(req.query.user)) {
        if (!Array.isArray(req.query.user)) {
            zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ["user"], message: 'Expected integer or array of integers' });
        } else {
            zerrors.addIssues(arrayOfUserIdValidation.safeParse(
                req.query.user.forEach((val) => dynamicParseStringToPrimitives(val))
            ).error?.issues.map((val) => {
                val.path.unshift('user');
                return val;
            }));
        }
    }
    if (req.query.winner != null && !isStringInteger(req.query.winner)) {
        if (!Array.isArray(req.query.winner)) {
            zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ["winner"], message: 'Expected integer or array of integers' });
        } else {
            zerrors.addIssues(arrayOfUserIdValidation.safeParse(
                req.query.winner.forEach((val) => dynamicParseStringToPrimitives(val))
            ).error?.issues.map((val) => {
                val.path.unshift('winner');
                return val;
            }));
        }
    }
    if (req.query.loser != null && !isStringInteger(req.query.loser)) {
        if (!Array.isArray(req.query.loser)) {
            zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ["loser"], message: 'Expected integer or array of integers' });
        } else {
            zerrors.addIssues(arrayOfUserIdValidation.safeParse(
                req.query.loser.forEach((val) => dynamicParseStringToPrimitives(val))
            ).error?.issues.map((val) => {
                val.path.unshift('loser');
                return val;
            }));
        }
    }
    if (req.query.orderByAsc != null && ((orderByAsc = stringToBoolean(req.query.receivedMessages)) === undefined)) {
        zerrors.addIssue({ code: ZodIssueCode.invalid_type, path: ["orderByAsc"], message: 'Expected boolean. Allowed values are: ["true", "1", "yes", "y", "false", "0", "no", "n"]' });
    }

    if (zerrors.issues.length !== 0) {
        return res.status(400).json(new ResponseError('Bad Request', zerrors, 'query'));
    }

    let { limit, offset, gameId, user, winner, loser, orderByAsc } = req.query;


    try {
        const result = await getGamesDB(Object.keys({
            offset,
            limit,
            gameId,
            user,
            winner,
            loser
        }).forEach(key => obj[key] === undefined && delete obj[key]));

        return res.status(200).json({
            totalCount: result.totalCount,
            next: result.offset + result.limit >= result.totalCount ? null : `${process.env.HOST ?? `http://localhost:${process.env.PORT ?? 5000}`}/api/messages?offset=${result.offset + result.limit < 0 ? 0 : result.offset}&limit=${result.offset + 2 * result.limit > result.totalresult ? result.totalCount - result.limit : result.limit}`,
            previous: offset === 0 ? null : `${process.env.HOST ?? `http://localhost:${process.env.PORT ?? 5000}`}/api/messages?offset=${(result.offset - result.limit < 0) ? 0 : (result.offset - result.limit > result.totalCount ? result.totalCount - result.limit : result.offset - result.limit)}&limit=${result.offset - result.limit < 0 ? result.offset : result.limit}`,
            data: result.gamesData
        });
    } catch (error) {
        return res.status(500).json(new ResponseError(error.message));
    }
}

module.exports = {
    getGameById,
    getGames
}